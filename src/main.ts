import { DateTime } from 'luxon';
import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { createDirectoryIfNonExistent, createFileIfNonExistent, getLinesFromFile } from './helpers';
import { calculateTimeFromActiveFile, getWeekNameFromDate } from './time';

interface TimeEntryTurnerSettings {
    dailyNoteDirectory: string;
    dreamDirectory: string;
    dreamSection: string;
}

const DEFAULT_SETTINGS: TimeEntryTurnerSettings = {
    dailyNoteDirectory: 'Daily Notes',
    dreamDirectory: 'Dream Journal',
    dreamSection: '### Dream Journal'
};

const SUBSECTION_PREFIX = '###';

export default class TimeEntryTurnerPlugin extends Plugin {
    settings: TimeEntryTurnerSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new TimeEntryTurnerSettingTab(this.app, this));

        this.addCommand({
            id: 'calculate-time',
            name: 'Calculate Time',
            callback: () => calculateTimeFromActiveFile(this.app)
        });

        this.addRibbonIcon('wand', 'Add up time entries', () => {
            calculateTimeFromActiveFile(this.app);
        });

        this.addRibbonIcon('sync', 'Organize daily notes', () => {
            this.moveDailyNotesToTheirWeekDirectory();
        });

        this.addRibbonIcon('cloud-moon', 'Copy dreams to journal', () => {
            this.copyActiveNoteDreamSectionToJournal();
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private moveDailyNotesToTheirWeekDirectory = async () => {
        const allMarkdownFiles = this.app.vault.getMarkdownFiles();

        const today = DateTime.now();
        const filesToMove = allMarkdownFiles.filter((file) => {
            if (file.basename === today.toISO().substring(0, 10)) {
                return false;
            }

            return file.parent.path === this.settings.dailyNoteDirectory;
        });

        if (filesToMove.length === 0) {
            new Notice('No files to move');
            return;
        }

        let filesMoved = 0;
        filesToMove.forEach(async (file) => {
            try {
                const weekName = getWeekNameFromDate(file.basename);
                const directory = `${this.settings.dailyNoteDirectory}/${weekName}`;
                const newPath = `${directory}/${file.name}`;
                await createDirectoryIfNonExistent(directory, app);
                await this.app.vault.rename(file, newPath);
                filesMoved += 1;
            } catch (error) {
                console.warn(`Error moving ${file.basename}`);
                console.warn(error);
            }
        });

        if (filesMoved === 0) {
            new Notice('No files moved');
            return;
        }

        new Notice(`${filesMoved} files moved`);
    };

    private copyActiveNoteDreamSectionToJournal = async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('No active file');
            return;
        }

        const fileLines = await getLinesFromFile(activeFile, this.app);
        const dreamSectionStartIdx = fileLines.findIndex((line) => line === this.settings.dreamSection);
        if (dreamSectionStartIdx === -1) {
            new Notice('No dreams to add');
            return;
        }

        // We assume the dream section to end at the next ### OR the end of the file, whichever comes first
        const dreamSectionEndIdx = fileLines.findIndex((line, idx) => {
            if (idx <= dreamSectionStartIdx) {
                return false;
            } else {
                return line.startsWith(SUBSECTION_PREFIX);
            }
        });

        const dreamSectionLines = fileLines.filter((_, idx) => {
            if (idx <= dreamSectionStartIdx) {
                return false;
            } else if (dreamSectionEndIdx === -1) {
                return true;
            } else {
                return idx < dreamSectionEndIdx;
            }
        });
        if (dreamSectionLines.length === 0) {
            new Notice('No dreams to add');
            return;
        }

        let year = activeFile.basename.substring(0, 4);
        if (!year.match(/\d{4}/g)) {
            const today = DateTime.now();
            year = today.year.toString();
        }

        try {
            await createDirectoryIfNonExistent(this.settings.dreamDirectory, app);

            const dreamJournalName = `${year} Dreams`;
            const dreamJournalPath = `${this.settings.dreamDirectory}/${dreamJournalName}.md`;
            await createFileIfNonExistent(dreamJournalPath, this.app);
            const dreamJournalFile = this.app.vault.getAbstractFileByPath(dreamJournalPath) as TFile;

            const dreamEntryTitle = `${SUBSECTION_PREFIX} ${activeFile.basename.substring(0, 10)}`;
            const dreamJournalLines = await getLinesFromFile(dreamJournalFile, this.app);
            if (dreamJournalLines.find((line) => line === dreamEntryTitle)) {
                new Notice('Dreams already added to journal');
                return;
            }
            const dataToAppend = `\n\n${dreamEntryTitle}\n${dreamSectionLines.join('\n')}`;
            await this.app.vault.adapter.append(dreamJournalPath, dataToAppend);

            new Notice('Dreams added');
        } catch (error) {
            console.warn(error);
            new Notice('Failed to add dreams');
        }
    };
}

class TimeEntryTurnerSettingTab extends PluginSettingTab {
    plugin: TimeEntryTurnerPlugin;

    constructor(app: App, plugin: TimeEntryTurnerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for Time Entry Turner' });
        new Setting(containerEl)
            .setName('Daily Note Root Directory')
            .setDesc(
                'The root directory for your daily notes. e.g. If it is a directory called "Daily Notes", then this setting should be "Daily Notes" no quotations.'
            )
            .addText((text) =>
                text
                    .setPlaceholder('Enter the directory')
                    .setValue(this.plugin.settings.dailyNoteDirectory)
                    .onChange(async (directory) => {
                        this.plugin.settings.dailyNoteDirectory = directory;
                        this.plugin.saveSettings();
                    })
            );
    }
}

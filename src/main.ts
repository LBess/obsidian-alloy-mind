import { DateTime } from 'luxon';
import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import {
    buildDreamSectionFilter,
    createFolderIfNonExistent,
    createFileIfNonExistent,
    getDateFromISO,
    getLinesFromFile,
    getYearFromISO
} from './helpers';
import { calculateTimeFromActiveFile, compareDates, getWeekNameFromDate } from './time';
import { StringFormatter } from './StringFormatter';
import { SUBSECTION_PREFIX } from './Constants';

interface TimeEntryTurnerSettings {
    dailyNoteFolder: string;
    dreamFolder: string;
    dreamSection: string;
}

const DEFAULT_SETTINGS: TimeEntryTurnerSettings = {
    dailyNoteFolder: 'Daily Notes',
    dreamFolder: 'Dream Journal',
    dreamSection: '### Dream Journal'
};

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

        this.addRibbonIcon('wand', 'Add up time entries', async () => {
            await calculateTimeFromActiveFile(this.app);
        });

        this.addRibbonIcon('sync', 'Organize daily notes', async () => {
            const notes = await this.getDailyNotesToMove();
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                await this.copyDreamsToJournal(note);
            }
            await this.moveNotesToTheirWeekFolder(notes);
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private getDailyNotesToMove = async () => {
        const today = getDateFromISO(DateTime.now().toISO());

        const notes = this.app.vault.getMarkdownFiles();
        const notesToMove = notes.filter((file) => {
            if (file.basename === today) return false;

            const isNotInWeekFolder = file.parent.path === this.settings.dailyNoteFolder;
            return isNotInWeekFolder;
        });

        return notesToMove.sort(compareDates);
    };

    private copyDreamsToJournal = async (note: TFile) => {
        const fileLines = await getLinesFromFile(note, this.app);
        const dreamSectionStartIdx = fileLines.findIndex((line) => line === this.settings.dreamSection);
        if (dreamSectionStartIdx === -1) return;

        // We assume the dream section to end at the next ### OR the end of the file, whichever comes first
        const dreamSectionEndIdx = fileLines.findIndex((line, idx) => {
            if (idx <= dreamSectionStartIdx) {
                return false;
            }

            return line.startsWith(SUBSECTION_PREFIX) || idx === fileLines.length - 1;
        });
        if (dreamSectionEndIdx === -1) return;

        const dreamSectionFilter = buildDreamSectionFilter(dreamSectionStartIdx, dreamSectionEndIdx);
        const dreamSectionLines = fileLines.filter(dreamSectionFilter);
        if (dreamSectionLines.length === 0) return;

        let year = getYearFromISO(note.basename);
        if (!year.match(/\d{4}/g)) {
            const today = DateTime.now();
            year = today.year.toString();
        }

        try {
            await createFolderIfNonExistent(this.settings.dreamFolder, app);

            const dreamJournalName = `${year} Dreams`;
            const dreamJournalPath = StringFormatter.buildPath(this.settings.dreamFolder, dreamJournalName, '.md');
            await createFileIfNonExistent(dreamJournalPath, this.app);
            const dreamJournalFile = this.app.vault.getAbstractFileByPath(dreamJournalPath) as TFile;

            const dreamEntryTitle = StringFormatter.buildDreamEntryTitle(note);
            const dreamJournalLines = await getLinesFromFile(dreamJournalFile, this.app);
            if (dreamJournalLines.find((line) => line === dreamEntryTitle)) {
                new Notice('Dreams already added to journal');
                return;
            }

            const dreamEntry = StringFormatter.buildDreamEntry(dreamEntryTitle, dreamSectionLines);
            await this.app.vault.adapter.append(dreamJournalPath, dreamEntry);
        } catch (error) {
            console.warn(error);
            new Notice('Failed to add dreams');
        }
    };

    private moveNotesToTheirWeekFolder = async (notes: TFile[]) => {
        if (notes.length === 0) {
            new Notice('No notes to move');
            return;
        }

        let notesMoved = 0;
        notes.forEach(async (file) => {
            try {
                const weekName = getWeekNameFromDate(file.basename);
                const folder = StringFormatter.buildPath(this.settings.dailyNoteFolder, weekName);
                const newPath = StringFormatter.buildPath(folder, file.name);
                await createFolderIfNonExistent(folder, app);
                await this.app.vault.rename(file, newPath);
                notesMoved += 1;
            } catch (error) {
                console.warn(`Error moving ${file.basename}`, error);
            }
        });

        if (notesMoved === 0) {
            new Notice('No notes moved');
            return;
        }

        new Notice(`${notesMoved} notes moved`);
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
            .setName('Daily Note Folder')
            .setDesc(
                'The root folder for your daily notes. e.g. If it is a folder called "Daily Notes", then this setting should be "Daily Notes" no quotations.'
            )
            .addText((text) =>
                text
                    .setPlaceholder('Enter the Folder')
                    .setValue(this.plugin.settings.dailyNoteFolder)
                    .onChange(async (folder) => {
                        this.plugin.settings.dailyNoteFolder = folder;
                        this.plugin.saveSettings();
                    })
            );
    }
}

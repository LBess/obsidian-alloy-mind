import { DateTime } from 'luxon';
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { getActiveFile, getLinesFromActiveNote } from './helpers';
import { calculateTimeFromActiveNote, getWeekNameFromDate } from './time';

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

export default class TimeEntryTurnerPlugin extends Plugin {
    settings: TimeEntryTurnerSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new TimeEntryTurnerSettingTab(this.app, this));

        this.addCommand({
            id: 'calculate-time',
            name: 'Calculate Time',
            callback: () => calculateTimeFromActiveNote(this.app)
        });

        this.addRibbonIcon('wand', 'Add up time entries', () => {
            calculateTimeFromActiveNote(this.app);
        });

        this.addRibbonIcon('sync', 'Organize daily notes', () => {
            this.moveDailyNotesToTheirWeekDirectory();
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private moveDailyNotesToTheirWeekDirectory = async () => {
        const allFiles = this.app.vault.getMarkdownFiles();
        const filesToMove = allFiles.filter((file) => file.parent.path === this.settings.dailyNoteDirectory);

        filesToMove.forEach(async (file) => {
            const today = DateTime.now();
            if (file.basename === today.toISO().substring(0, 10)) {
                return;
            }

            try {
                const weekName = getWeekNameFromDate(file.basename);
                const directory = `${this.settings.dailyNoteDirectory}/${weekName}`;
                const newPath = `${directory}/${file.name}`;
                const directoryExists = await this.app.vault.adapter.exists(directory);
                if (!directoryExists) {
                    await this.app.vault.createFolder(directory);
                }

                await this.app.vault.rename(file, newPath);
            } catch (error) {
                console.warn(error);
            }
        });
    };

    private copyActiveNoteDreamSectionToJournal = async () => {
        const fileLines = await getLinesFromActiveNote(this.app);
        const dreamSectionStartIdx = fileLines.findIndex((line) => line === this.settings.dreamSection);

        // We assume the dream section to end at the next ### OR the end of the file, whichever comes first
        const dreamSectionEndIdx = fileLines.findIndex((line, idx) => {
            if (idx <= dreamSectionStartIdx) return false;

            if (line.startsWith('###')) return true;

            return false;
        });

        const dreamSectionLines = fileLines.filter((_, idx) => {
            if (idx <= dreamSectionEndIdx) return false;

            if (dreamSectionEndIdx !== -1 && idx >= dreamSectionEndIdx) return false;

            return true;
        });

        let yearStr = getActiveFile(this.app).basename.substring(0, 4);
        if (yearStr.match(/\d{4}/g) === null) {
            const today = DateTime.now();
            yearStr = today.year.toString();
        }

        // satisfying linter
        return dreamSectionLines;
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

import { DateTime } from 'luxon';
import { Notice, Plugin, TFile } from 'obsidian';
import {
    buildDreamSectionFilter,
    createFolderIfNonExistent,
    createFileIfNonExistent,
    getLinesFromFile
} from './utils/obsidianUtils';
import { calculateTimeFromActiveFile, compareDatesAscending, getWeekNameFromDate } from './utils/dateTimeUtils';
import { SUBSECTION_PREFIX } from './Constants';
import { buildDreamEntry, buildDreamEntryTitle, buildPath, getDateFromISO, getYearFromISO } from './utils/stringUtils';
import { AlloyMindSettingTab } from './AlloyMindSettingTab';

interface AlloyMindSettings {
    dailyNoteFolder: string;
    dreamJournalFolder: string;
    dreamSection: string;
}

const DEFAULT_SETTINGS: AlloyMindSettings = {
    dailyNoteFolder: 'Daily Notes',
    dreamJournalFolder: 'Dream Journal',
    dreamSection: '### Dream Journal'
};

export default class AlloyMindPlugin extends Plugin {
    settings: AlloyMindSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new AlloyMindSettingTab(this.app, this));

        this.addCommand({
            id: 'calculate-time',
            name: 'Calculate Time',
            callback: () => calculateTimeFromActiveFile(this.app)
        });

        this.addRibbonIcon('sync', 'Organize daily notes', async () => {
            const notes = await this.getDailyNotesToMove();
            for (const note of notes) {
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

        return notesToMove.sort(compareDatesAscending);
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
            await createFolderIfNonExistent(this.settings.dreamJournalFolder, app);

            const dreamJournalName = `${year} Dreams`;
            const dreamJournalPath = buildPath(this.settings.dreamJournalFolder, dreamJournalName, '.md');
            await createFileIfNonExistent(dreamJournalPath, this.app);
            const dreamJournalFile = this.app.vault.getAbstractFileByPath(dreamJournalPath) as TFile;

            const dreamEntryTitle = buildDreamEntryTitle(note);
            const dreamJournalLines = await getLinesFromFile(dreamJournalFile, this.app);
            if (dreamJournalLines.find((line) => line === dreamEntryTitle)) {
                return;
            }

            const dreamEntry = buildDreamEntry(dreamEntryTitle, dreamSectionLines);
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
        for (const note of notes) {
            try {
                const weekName = getWeekNameFromDate(note.basename);
                const folder = buildPath(this.settings.dailyNoteFolder, weekName);
                const newPath = buildPath(folder, note.name);
                await createFolderIfNonExistent(folder, app);
                await this.app.vault.rename(note, newPath);
                notesMoved += 1;
            } catch (error) {
                console.warn(`Error moving ${note.basename}`, error);
            }
        }

        new Notice(`${notesMoved} notes moved`);
    };
}

import { DateTime } from 'luxon';
import { Vault, Notice, TFile } from 'obsidian';
import { AlloyMindSettings } from 'AlloyMindPlugin';
import { compareDatesAscending, getWeekNameFromDate } from 'utils/dateTimeUtils';
import {
    buildDreamSectionFilter,
    createFileIfNonExistent,
    createFolderIfNonExistent,
    getLinesFromFile,
    isNote
} from 'utils/obsidianUtils';
import {
    buildDreamEntry,
    buildDreamEntryTitle,
    buildDreamJournalName,
    buildPath,
    getDateFromISO,
    getYearFromISO
} from 'utils/stringUtils';
import { Constants } from 'Constants';

export class NoteOrganizer {
    private vault: Vault;
    private settings: AlloyMindSettings;

    constructor(vault: Vault, settings: AlloyMindSettings) {
        this.vault = vault;
        this.settings = settings;
    }

    getUnorganizedNotes = async () => {
        const dailyNoteFolder = this.vault.getFolderByPath(this.settings.dailyNoteFolder);
        if (dailyNoteFolder === null) {
            console.error('No daily note folder');
            return [];
        }

        const notes = dailyNoteFolder.children.filter(isNote) as TFile[];

        const today = getDateFromISO(DateTime.now().toISO());
        return notes.filter((note) => note.basename !== today).sort(compareDatesAscending);
    };

    copyDreamsToJournal = async (note: TFile) => {
        const fileLines = await getLinesFromFile(note, this.vault);
        const dreamSectionStartIdx = fileLines.findIndex((line) => line === this.settings.dreamSection);
        if (dreamSectionStartIdx === -1) return;

        // We assume the dream section to end at the next ### OR the end of the file, whichever comes first
        const dreamSectionEndIdx = fileLines.findIndex((line, idx) => {
            if (idx <= dreamSectionStartIdx) {
                return false;
            }

            return line.startsWith(Constants.SUBSECTION_PREFIX) || idx === fileLines.length - 1;
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
            await createFolderIfNonExistent(this.settings.dreamJournalFolder, this.vault);

            const dreamJournalName = buildDreamJournalName(year);
            const dreamJournalPath = buildPath(this.settings.dreamJournalFolder, dreamJournalName, '.md');
            await createFileIfNonExistent(dreamJournalPath, this.vault);
            const dreamJournalFile = this.vault.getAbstractFileByPath(dreamJournalPath) as TFile;

            const dreamEntryTitle = buildDreamEntryTitle(note);
            const dreamJournalLines = await getLinesFromFile(dreamJournalFile, this.vault);
            if (dreamJournalLines.find((line) => line === dreamEntryTitle)) {
                return;
            }

            const dreamEntry = buildDreamEntry(dreamEntryTitle, dreamSectionLines);
            await this.vault.adapter.append(dreamJournalPath, dreamEntry);
        } catch (error) {
            console.warn(error);
            new Notice('Failed to add dreams');
        }
    };

    moveNotesToWeekFolder = async (notes: TFile[]) => {
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
                await createFolderIfNonExistent(folder, this.vault);
                await this.vault.rename(note, newPath);
                notesMoved += 1;
            } catch (error) {
                console.warn(`Error moving ${note.basename}`, error);
            }
        }

        new Notice(`${notesMoved} notes moved`);
    };
}

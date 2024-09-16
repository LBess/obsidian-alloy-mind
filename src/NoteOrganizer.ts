import { DateTime } from 'luxon';
import { Vault, Notice, TFile } from 'obsidian';
import { AlloyMindSettings } from 'types/AlloyMindSettings';
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
import { Constants } from 'utils/Constants';
import { strings } from 'strings/strings';

const noticeStrings = strings.notices.noteOrganizer;

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
            new Notice(noticeStrings.noDailyNoteFolder);
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

        const dreamSectionEndIdx = fileLines.findIndex((line, idx) => {
            if (idx <= dreamSectionStartIdx) return false;

            const isDreamSection = line.startsWith(Constants.SUBSECTION_PREFIX);
            const isLastLine = idx === fileLines.length - 1;
            return isDreamSection || isLastLine;
        });
        if (dreamSectionEndIdx === -1) return;

        const dreamSectionFilter = buildDreamSectionFilter(dreamSectionStartIdx, dreamSectionEndIdx);
        const dreamSectionLines = fileLines.filter(dreamSectionFilter);
        if (dreamSectionLines.length === 0) return;

        const today = DateTime.now();
        const year = getYearFromISO(note.basename) ?? today.year.toString();
        try {
            await createFolderIfNonExistent(this.settings.dreamJournalFolder, this.vault);

            const dreamJournalName = buildDreamJournalName(year);
            const dreamJournalPath = buildPath(
                this.settings.dreamJournalFolder,
                dreamJournalName,
                Constants.MD_EXTENSION
            );
            await createFileIfNonExistent(dreamJournalPath, this.vault);
            const dreamJournalFile = this.vault.getAbstractFileByPath(dreamJournalPath) as TFile;

            const dreamEntryTitle = buildDreamEntryTitle(note);
            const dreamJournalLines = await getLinesFromFile(dreamJournalFile, this.vault);

            const isDreamEntryAlreadyAdded = dreamJournalLines.find((line) => line === dreamEntryTitle);
            if (isDreamEntryAlreadyAdded) return;

            const dreamEntry = buildDreamEntry(dreamEntryTitle, dreamSectionLines);
            await this.vault.adapter.append(dreamJournalPath, dreamEntry);
        } catch (error) {
            console.warn(error);
            new Notice(noticeStrings.failedToAddDreams);
        }
    };

    moveNotesToWeekFolder = async (notes: TFile[]) => {
        if (notes.length === 0) {
            new Notice(noticeStrings.noNotesToMove);
            return;
        }

        let numNotesMoved = 0;
        for (const note of notes) {
            try {
                const weekName = getWeekNameFromDate(note.basename);
                const folder = buildPath(this.settings.dailyNoteFolder, weekName);
                const newPath = buildPath(folder, note.name);
                await createFolderIfNonExistent(folder, this.vault);
                await this.vault.rename(note, newPath);
                numNotesMoved += 1;
            } catch (error) {
                console.warn(`Error moving ${note.basename}`, error);
            }
        }

        const noticeString = strings.formatString(noticeStrings.nNotesMoved, numNotesMoved) as string;
        new Notice(noticeString);
    };
}

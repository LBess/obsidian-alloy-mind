import { Constants } from 'Constants';
import { TFile } from 'obsidian';

export const buildDreamEntry = (title: string, lines: string[]) => {
    return `\n\n${title}\n${lines.join('\n')}`;
};

export const buildDreamEntryTitle = (note: TFile) => {
    const date = getDateFromISO(note.basename);
    return `${Constants.SUBSECTION_PREFIX} ${date}`;
};

export const buildDreamJournalName = (year: string) => `${year} Dreams`;

export const buildPath = (root: string, leaf: string, fileExtension = '') => {
    return `${root}/${leaf}${fileExtension}`;
};

export const getDateFromISO = (iso: string) => iso.substring(0, 10);

export const getYearFromISO = (iso: string) => iso.substring(0, 4);

export const getMonthAndDayFromISO = (iso: string) => iso.substring(5, 10);

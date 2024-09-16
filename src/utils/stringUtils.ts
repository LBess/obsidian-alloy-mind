import { Constants } from 'utils/Constants';
import { TFile } from 'obsidian';
import { strings } from 'strings/strings';

export const buildDreamEntry = (title: string, lines: string[]) => {
    return `\n\n${title}\n${lines.join('\n')}`;
};

export const buildDreamEntryTitle = (note: TFile) => {
    const date = getDateFromISO(note.basename);
    return `${Constants.SUBSECTION_PREFIX} ${date}`;
};

export const buildDreamJournalName = (year: string) => {
    return strings.formatString(strings.dreamJournalFile, year) as string;
};

export const buildPath = (root: string, leaf: string, fileExtension = '') => {
    return `${root}/${leaf}${fileExtension}`;
};

export const getDateFromISO = (iso: string) => {
    if (iso.length < Constants.ISO_DATE_LENGTH) return;

    return iso.substring(0, Constants.ISO_DATE_LENGTH);
};

export const getYearFromISO = (iso: string) => {
    if (iso.length < Constants.ISO_YEAR_LENGTH) return;

    return iso.substring(0, Constants.ISO_YEAR_LENGTH);
};

export const getMonthAndDayFromISO = (iso: string) => {
    if (iso.length < Constants.ISO_DATE_LENGTH) return;

    return iso.substring(Constants.ISO_YEAR_LENGTH + 1, Constants.ISO_DATE_LENGTH);
};

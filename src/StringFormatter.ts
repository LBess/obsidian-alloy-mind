import { TFile } from 'obsidian';
import { SUBSECTION_PREFIX } from './Constants';
import { getDateFromISO } from './helpers';

export class StringFormatter {
    static buildDreamEntry(title: string, lines: string[]) {
        return `\n\n${title}\n${lines.join('\n')}`;
    }

    static buildDreamEntryTitle(note: TFile) {
        const date = getDateFromISO(note.basename);
        return `${SUBSECTION_PREFIX} ${date}`;
    }

    static buildPath(root: string, leaf: string, fileExtension = '') {
        return `${root}/${leaf}${fileExtension}`;
    }
}

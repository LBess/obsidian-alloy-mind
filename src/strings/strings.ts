import LocalizedStrings, { LocalizedStringsMethods } from 'localized-strings';
import { en } from 'strings/languages/en';

export interface PluginStrings {
    commands: {
        calculateTime: string;
        lookupWord: string;
        organizeNotes: string;
    };
    settings: {
        title: string;
        dailyNote: {
            name: string;
            description: string;
            placeHolder: string;
        };
        dreamJournal: {
            name: string;
            description: string;
            placeHolder: string;
        };
        description: {
            title: string;
            body: string;
        };
        default: {
            dailyNoteFolder: string;
            dreamJournalFolder: string;
            dreamSection: string;
        };
    };
    notices: {
        lookupWord: {
            noEditor: string;
            noSelection: string;
            noWord: string;
            noData: string;
            noMeaning: string;
            noDefinition: string;
            definition: string;
        };
        noteOrganizer: {
            failedToAddDreams: string;
            noNotesToMove: string;
            nNotesMoved: string;
            noDailyNoteFolder: string;
        };
        noActiveFile: string;
    };
    dreamJournalFile: string;
}

type Strings = PluginStrings & LocalizedStringsMethods;

export const strings: Strings = new LocalizedStrings({
    en
});

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
    };
    notices: {
        lookupWord: {
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

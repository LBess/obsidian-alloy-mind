import { PluginStrings } from 'strings/strings';

export const en: PluginStrings = {
    commands: {
        calculateTime: 'Calculate Time',
        lookupWord: 'Lookup Word',
        organizeNotes: 'Organize Notes'
    },
    settings: {
        title: 'Settings for Alloy Mind',
        dailyNote: {
            name: 'Daily Note Folder',
            description:
                'The root folder for your daily notes. e.g. If it is a folder called "Daily Notes", then this setting should be "Daily Notes" no quotations.',
            placeHolder: 'Enter the Folder'
        },
        dreamJournal: {
            name: 'Dream Journal Folder',
            description: 'The root folder for your yearly dream journals.',
            placeHolder: 'Enter the Folder'
        },
        description: {
            title: 'Description',
            body: 'This is a custom Obsidian plugin I created to help with my usage of the app.'
        },
        default: {
            dailyNoteFolder: 'Daily Notes',
            dreamJournalFolder: 'Dream Journal',
            dreamSection: '{0} Dream Journal'
        }
    },
    notices: {
        lookupWord: {
            noEditor: 'No editor is open',
            noSelection: 'No word is selected',
            noWord: 'No word is selected',
            noData: 'No data returned',
            noMeaning: 'No meaning returned',
            noDefinition: 'No definition returned',
            definition: '{0}: {1}'
        },
        noteOrganizer: {
            failedToAddDreams: 'Failed to add dreams',
            noNotesToMove: 'No notes to move',
            nNotesMoved: '{0} notes moved',
            noDailyNoteFolder: 'No daily note folder'
        },
        noActiveFile: 'No active file'
    },
    dreamJournalFile: '{0} Dreams'
};

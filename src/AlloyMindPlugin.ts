import { Plugin } from 'obsidian';
import { calculateTimeFromActiveFile } from 'utils/dateTimeUtils';
import { AlloyMindSettingTab } from 'AlloyMindSettingTab';
import { NoteOrganizer } from 'NoteOrganizer';
import { DictionaryDirector } from 'DictionaryDirector';

export interface AlloyMindSettings {
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

        this.addCommand({
            id: 'lookup-word',
            name: ' Lookup Word',
            callback: this.lookupSelection
        });

        this.addRibbonIcon('book-type', 'Lookup Word', this.lookupSelection);

        this.addRibbonIcon('sync', 'Organize daily notes', async () => {
            const noteOrganizer = new NoteOrganizer(this.app.vault, this.settings);
            const notes = await noteOrganizer.getUnorganizedNotes();
            for (const note of notes) {
                await noteOrganizer.copyDreamsToJournal(note);
            }
            await noteOrganizer.moveNotesToWeekFolder(notes);
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    lookupSelection = async () => {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) {
            console.error('No active editor');
            return;
        }

        const director = new DictionaryDirector(editor);
        await director.lookupSelection();
    };
}

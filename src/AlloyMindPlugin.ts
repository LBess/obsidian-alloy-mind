import { Notice, Plugin } from 'obsidian';
import { calculateTimeFromActiveFile } from 'utils/dateTimeUtils';
import { AlloyMindSettingTab } from 'AlloyMindSettingTab';
import { NoteOrganizer } from 'NoteOrganizer';
import { DictionaryDirector } from 'DictionaryDirector';
import { AlloyMindSettings } from 'types/AlloyMindSettings';
import { strings } from 'strings/strings';
import { DEFAULT_SETTINGS } from 'utils/DefaultSettings';
import { Constants } from 'utils/Constants';
import { RibbonIcon } from 'utils/RibbonIcon';
import { CommandID } from 'utils/CommandID';

const commandStrings = strings.commands;
const noticeStrings = strings.notices.lookupWord;

export default class AlloyMindPlugin extends Plugin {
    settings: AlloyMindSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new AlloyMindSettingTab(this.app, this));

        this.addCommand({
            id: CommandID.CALCULATE_TIME,
            name: commandStrings.calculateTime,
            callback: () => calculateTimeFromActiveFile(this.app)
        });

        this.addCommand({
            id: CommandID.LOOKUP_WORD,
            name: commandStrings.lookupWord,
            callback: this.lookupWord
        });

        this.addRibbonIcon(RibbonIcon.LOOKUP_WORD, commandStrings.lookupWord, this.lookupWord);

        this.addRibbonIcon(RibbonIcon.ORGANIZE_NOTES, commandStrings.organizeNotes, async () => {
            const noteOrganizer = new NoteOrganizer(this.app.vault, this.settings);
            const notes = await noteOrganizer.getUnorganizedNotes();
            if (notes.length === 0) return;

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

    lookupWord = async () => {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) {
            new Notice(noticeStrings.noEditor);
            return;
        }

        const selection = editor.getSelection();
        if (!selection) {
            new Notice(noticeStrings.noSelection);
            return;
        }

        const [word] = selection.split(' ');
        if (!word) {
            new Notice(noticeStrings.noWord);
            return;
        }

        const director = new DictionaryDirector();
        const definition = await director.getDefinition(word);
        if (!definition) return;

        const noticeString = strings.formatString(noticeStrings.definition, word, definition) as string;
        new Notice(noticeString, Constants.DEFINITION_NOTICE_LENGTH);
    };
}

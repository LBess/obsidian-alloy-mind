import { Constants } from 'utils/Constants';
import axios from 'axios';
import { Editor, Notice } from 'obsidian';
import { strings } from 'strings/strings';
import { DictionaryLookupResponse } from 'types/DictionaryLookupResponse';

const notices = strings.notices.lookupWord;

export class DictionaryDirector {
    private editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    lookupSelection = async () => {
        const selection = this.editor.getSelection();
        if (!selection) {
            console.error('Selection is null');
            return;
        }

        const url = buildDictionaryLookupUrl(selection);
        try {
            const { data } = await axios.get<DictionaryLookupResponse[]>(url);
            if (!data || data.length === 0) {
                throw new Error(notices.noData);
            }

            const [meaning] = data[0].meanings;
            if (!meaning) {
                throw new Error(notices.noMeaning);
            }

            const [definition] = meaning.definitions;
            if (!definition) {
                throw new Error(notices.noDefinition);
            }

            const definitionText = definition.definition.toLowerCase();

            navigator.clipboard.writeText(definitionText);

            const noticeString = strings.formatString(notices.definition, selection, definitionText) as string;
            new Notice(noticeString, Constants.DICTIONARY_NOTICE_LENGTH);
        } catch (error) {
            console.error(error);
        }
    };
}

const buildDictionaryLookupUrl = (word: string) => `${Constants.DICTIONARY_API_URL}${word}`;

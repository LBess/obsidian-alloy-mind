import { Constants } from 'Constants';
import axios from 'axios';
import { Editor, Notice } from 'obsidian';
import { DictionaryLookupResponse } from 'types/DictionaryLookupResponse';

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

        const url = `${Constants.DICTIONARY_API_URL}${selection}`;
        try {
            const { data } = await axios.get<DictionaryLookupResponse[]>(url);
            if (!data || data.length === 0) {
                throw new Error('No data returned');
            }

            const [meaning] = data[0].meanings;
            if (!meaning) {
                throw new Error('No meaning returned');
            }

            const [definition] = meaning.definitions;
            if (!definition) {
                throw new Error('No definition returned');
            }

            const definitionText = definition.definition.toLowerCase();

            navigator.clipboard.writeText(definitionText);
            new Notice(`${selection}: ${definitionText}`, 5000);
        } catch (error) {
            console.error(error);
        }
    };
}

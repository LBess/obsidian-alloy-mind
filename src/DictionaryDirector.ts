import { Constants } from 'utils/Constants';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import { strings } from 'strings/strings';
import { GetDefinitionResponseData } from 'types/DictionaryLookupResponse';
import { Notice } from 'obsidian';

const notices = strings.notices.lookupWord;

class NoticeError extends Error {}

/**
 * API Documentation: https://dictionaryapi.dev/
 */
export class DictionaryDirector {
    /**
     * Returns the definition for the word and writes
     * it to the clipboard.
     *
     * @param word
     */
    getDefinition = async (word: string) => {
        const url = buildDictionaryLookupUrl(word);

        try {
            const { data } = await axios.get<GetDefinitionResponseData>(url);
            if (!data || data.length === 0) {
                throw new NoticeError(notices.noData);
            }

            const [response] = data;
            const [meaning] = response.meanings;
            if (!meaning) {
                throw new NoticeError(notices.noMeaning);
            }

            const [definition] = meaning.definitions;
            if (!definition) {
                throw new NoticeError(notices.noDefinition);
            }

            const definitionText = definition.definition.toLowerCase();
            navigator.clipboard.writeText(definitionText);

            return definitionText;
        } catch (error) {
            console.error(error);

            if (error instanceof AxiosError && error.response?.status === HttpStatusCode.NotFound) {
                new Notice(notices.noDefinition);
            }

            if (error instanceof NoticeError) {
                new Notice(error.message);
            }
        }
    };
}

const buildDictionaryLookupUrl = (word: string) => `${Constants.DICTIONARY_API_URL}${word}`;

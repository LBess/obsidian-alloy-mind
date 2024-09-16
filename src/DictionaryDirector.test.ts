import { Constants } from 'utils/Constants';
import { DictionaryDirector } from 'DictionaryDirector';
import { EditorFactory } from 'test/factories/EditorFactory';
import { mockAxios } from 'test/mocks/mockAxios';
import { mockConsoleError } from 'test/mocks/mockConsoleError';
import { DictionaryLookupResponse } from 'types/DictionaryLookupResponse';

const dictionaryLookupResponse: DictionaryLookupResponse = {
    meanings: [
        {
            definitions: [
                {
                    definition: 'bar'
                }
            ],
            partOfSpeech: 'adjective'
        }
    ],
    word: 'foo',
    sourceUrls: []
};

describe('DictionaryDirector', () => {
    beforeEach(() => {
        mockClipboardWriteText();
    });

    it('calls axios.get with the correct argument', async () => {
        const get = jest.fn().mockResolvedValue({ data: [dictionaryLookupResponse] });
        mockAxios(get);

        const word = 'foo';
        const getSelection = jest.fn().mockReturnValue(word);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupWord();

        expect(get).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledWith(`${Constants.DICTIONARY_API_URL}${word}`);
    });

    it('calls clipboard.writeText with the correct argument', async () => {
        const writeText = mockClipboardWriteText();

        const get = jest.fn().mockResolvedValue({ data: [dictionaryLookupResponse] });
        mockAxios(get);

        const word = 'foo';
        const getSelection = jest.fn().mockReturnValue(word);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupWord();

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText).toHaveBeenCalledWith(dictionaryLookupResponse.meanings[0].definitions[0].definition);
    });

    it('does not call clipboard.writeText when an error is thrown', async () => {
        const consoleError = mockConsoleError();

        const writeText = mockClipboardWriteText();

        const error = new Error('foo');
        const get = jest.fn().mockRejectedValue(new Error('foo'));
        mockAxios(get);

        const word = 'foo';
        const getSelection = jest.fn().mockReturnValue(word);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupWord();

        expect(writeText).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(error);
    });

    it('does not call axios.get if no word is returned', async () => {
        const get = jest.fn();
        mockAxios(get);
        const consoleError = mockConsoleError();

        const getSelection = jest.fn().mockReturnValue(undefined);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupWord();

        expect(get).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledTimes(1);
    });
});

const mockClipboardWriteText = (writeText = jest.fn()) => {
    Object.assign(navigator, {
        clipboard: {
            writeText
        }
    });
    return writeText;
};

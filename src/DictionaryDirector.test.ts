import { Constants } from 'Constants';
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
        mockWriteText();
    });

    it('calls axios.get with the correct argument', async () => {
        const get = jest.fn().mockResolvedValue({ data: [dictionaryLookupResponse] });
        mockAxios(get);

        const selection = 'foo';
        const getSelection = jest.fn().mockReturnValue(selection);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupSelection();

        expect(get).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledWith(`${Constants.DICTIONARY_API_URL}${selection}`);
    });

    it('calls clipboard.writeText with the correct argument', async () => {
        const writeText = mockWriteText();

        const get = jest.fn().mockResolvedValue({ data: [dictionaryLookupResponse] });
        mockAxios(get);

        const selection = 'foo';
        const getSelection = jest.fn().mockReturnValue(selection);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupSelection();

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText).toHaveBeenCalledWith(dictionaryLookupResponse.meanings[0].definitions[0].definition);
    });

    it('does not call clipboard.writeText when an error is thrown', async () => {
        const consoleError = mockConsoleError();

        const writeText = mockWriteText();

        const error = new Error('foo');
        const get = jest.fn().mockRejectedValue(new Error('foo'));
        mockAxios(get);

        const selection = 'foo';
        const getSelection = jest.fn().mockReturnValue(selection);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupSelection();

        expect(writeText).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(error);
    });

    it('does not call axios.get if no selection is returned', async () => {
        const get = jest.fn();
        mockAxios(get);
        const consoleError = mockConsoleError();

        const getSelection = jest.fn().mockReturnValue(undefined);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupSelection();

        expect(get).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledTimes(1);
    });
});

const mockWriteText = (writeText = jest.fn()) => {
    Object.assign(navigator, {
        clipboard: {
            writeText
        }
    });
    return writeText;
};

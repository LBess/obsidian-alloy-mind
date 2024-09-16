import { Constants } from 'utils/Constants';
import { DictionaryDirector } from 'DictionaryDirector';
import { mockAxios } from 'test/mocks/mockAxios';
import { mockConsoleError } from 'test/mocks/mockConsoleError';
import { GetDefinitionResponseData } from 'types/DictionaryLookupResponse';

const apple = 'apple';
const appleDefinition = 'A yummy fruit';

const getDefinitionResponseData: GetDefinitionResponseData = [
    {
        meanings: [
            {
                definitions: [
                    {
                        definition: appleDefinition
                    }
                ],
                partOfSpeech: 'noun'
            }
        ],
        word: apple,
        sourceUrls: []
    }
];

describe('DictionaryDirector', () => {
    beforeEach(() => {
        mockClipboardWriteText();
    });

    describe('getDefinition', () => {
        it('calls axios.get with the correct argument', async () => {
            const get = jest.fn().mockResolvedValue({ data: getDefinitionResponseData });
            mockAxios(get);

            const director = new DictionaryDirector();
            await director.getDefinition(apple);

            expect(get).toHaveBeenCalledTimes(1);
            expect(get).toHaveBeenCalledWith(`${Constants.DICTIONARY_API_URL}${apple}`);
        });

        it('returns the correct definition', async () => {
            const get = jest.fn().mockResolvedValue({ data: getDefinitionResponseData });
            mockAxios(get);

            const director = new DictionaryDirector();
            const definition = await director.getDefinition(apple);

            const appleDefinitionLower = appleDefinition.toLowerCase();
            expect(definition).toEqual(appleDefinitionLower);
        });

        it('calls clipboard.writeText with the correct argument', async () => {
            const writeText = mockClipboardWriteText();

            const get = jest.fn().mockResolvedValue({ data: getDefinitionResponseData });
            mockAxios(get);

            const director = new DictionaryDirector();
            await director.getDefinition(apple);

            const appleDefinitionLower = appleDefinition.toLowerCase();
            expect(writeText).toHaveBeenCalledTimes(1);
            expect(writeText).toHaveBeenCalledWith(appleDefinitionLower);
        });

        it('does not call clipboard.writeText when an error is thrown', async () => {
            const consoleError = mockConsoleError();

            const writeText = mockClipboardWriteText();

            const error = Error('foo');
            const get = jest.fn().mockRejectedValue(error);
            mockAxios(get);

            const director = new DictionaryDirector();
            await director.getDefinition(apple);

            expect(writeText).not.toHaveBeenCalled();
            expect(consoleError).toHaveBeenCalledTimes(1);
            expect(consoleError).toHaveBeenCalledWith(error);
        });
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

import { Constants } from 'Constants';
import { DictionaryDirector } from 'DictionaryDirector';
import { EditorFactory } from 'test/factories/EditorFactory';
import { mockAxios } from 'test/mocks/mockAxios';

const apiResponse = {
    data: [
        {
            meanings: [
                {
                    definitions: [
                        {
                            definition: 'bar'
                        }
                    ]
                }
            ]
        }
    ]
};

describe('DictionaryDirector', () => {
    it('calls axios.get with the correct argument', async () => {
        const get = jest.fn().mockResolvedValue(apiResponse);
        mockAxios(get);

        const selection = 'foo';
        const getSelection = jest.fn().mockReturnValue(selection);
        const editor = EditorFactory.create({ getSelection });

        const director = new DictionaryDirector(editor);
        await director.lookupSelection();

        expect(get).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledWith(`${Constants.DICTIONARY_API_URL}${selection}`);
    });
});

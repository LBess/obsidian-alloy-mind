export type GetDefinitionResponseData = GetDefinitionResponse[];

interface GetDefinitionResponse {
    meanings: DictionaryMeaning[];
    word: string;
    sourceUrls: string[];
}

interface DictionaryMeaning {
    definitions: DictionaryDefinition[];
    partOfSpeech: string;
}

interface DictionaryDefinition {
    definition: string;
}

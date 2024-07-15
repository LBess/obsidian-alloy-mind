import { TAbstractFile, TFile, Vault } from 'obsidian';
import * as ObisidianUtils from 'utils/obsidianUtils';

interface ObisidianUtilsConfig {
    getLinesFromFile: (file: TFile, vault: Vault) => Promise<string[]>;
    createFolderIfNonExistent: (folder: string, vault: Vault) => Promise<void>;
    createFileIfNonExistent: (filePath: string, vault: Vault) => Promise<void>;
    isNote: (abstractFile: TAbstractFile) => boolean;
}

export const mockObsidianUtils = (config?: Partial<ObisidianUtilsConfig>) => {
    jest.spyOn(ObisidianUtils, 'getLinesFromFile').mockImplementation(config?.getLinesFromFile ?? jest.fn());
    jest.spyOn(ObisidianUtils, 'createFolderIfNonExistent').mockImplementation(
        config?.createFolderIfNonExistent ?? jest.fn()
    );
    jest.spyOn(ObisidianUtils, 'createFileIfNonExistent').mockImplementation(
        config?.createFileIfNonExistent ?? jest.fn()
    );
    jest.spyOn(ObisidianUtils, 'isNote').mockImplementation(config?.isNote ?? jest.fn().mockReturnValue(true));
};

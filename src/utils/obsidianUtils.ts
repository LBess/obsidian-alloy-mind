import { Notice, TAbstractFile, TFile, Vault, Workspace } from 'obsidian';
import { strings } from 'strings/strings';

export class NoActiveFileError extends Error {
    constructor() {
        super();
        this.message = strings.notices.noActiveFile;
    }
}

export const getActiveFile = (workspace: Workspace): TFile => {
    const activeFile = workspace.getActiveFile();
    if (!activeFile) {
        throw new NoActiveFileError();
    }

    return activeFile;
};

export const getLinesFromFile = async (file: TFile, vault: Vault): Promise<string[]> => {
    try {
        const fileStr = await vault.read(file);
        return fileStr.split('\n');
    } catch (error) {
        console.error(error);
        if (error instanceof NoActiveFileError) {
            new Notice(error.message);
        }
        return [];
    }
};

export const buildDreamSectionFilter = (startIdx: number, endIdx: number) => {
    return (_: string, idx: number) => {
        if (idx <= startIdx) {
            return false;
        }

        return idx <= endIdx;
    };
};

export const createFolderIfNonExistent = async (folder: string, vault: Vault): Promise<void> => {
    const folderExists = await vault.adapter.exists(folder);
    if (folderExists) return;

    await vault.createFolder(folder);
};

export const createFileIfNonExistent = async (filePath: string, vault: Vault): Promise<void> => {
    const fileExists = await vault.adapter.exists(filePath);
    if (fileExists) return;

    await vault.create(filePath, '');
};

export const isNote = (abstractFile: TAbstractFile) => abstractFile instanceof TFile;

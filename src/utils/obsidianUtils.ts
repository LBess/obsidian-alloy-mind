import { App, Notice, TFile } from 'obsidian';

export class NoActiveFileError extends Error {}

export const getActiveFile = (app: App): TFile => {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        throw new NoActiveFileError();
    }

    return activeFile;
};

export const getLinesFromFile = async (file: TFile, app: App): Promise<string[]> => {
    try {
        const fileStr = await app.vault.read(file);
        return fileStr.split('\n');
    } catch (error) {
        console.error(error);
        if (error instanceof NoActiveFileError) {
            new Notice('No active file');
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

export const createFolderIfNonExistent = async (folder: string, app: App): Promise<void> => {
    const folderExists = await app.vault.adapter.exists(folder);
    if (folderExists) return;

    await app.vault.createFolder(folder);
};

export const createFileIfNonExistent = async (filePath: string, app: App): Promise<void> => {
    const fileExists = await app.vault.adapter.exists(filePath);
    if (fileExists) return;

    await app.vault.create(filePath, '');
};

import { App, Notice, TFile } from 'obsidian';

export class NoActiveFileError extends Error {}

const getActiveFile = (app: App): TFile => {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        throw new NoActiveFileError();
    }

    return activeFile;
};

const getLinesFromActiveFile = async (app: App): Promise<string[]> => {
    try {
        const activeFile = getActiveFile(app);

        // TODO: Potentially do a non cachedRead here
        const fileStr = await app.vault.cachedRead(activeFile);
        return fileStr.split('\n');
    } catch (error) {
        console.error(error);
        if (error instanceof NoActiveFileError) {
            new Notice('No active file');
        }
        return [];
    }
};

const createDirectoryIfNonExistent = async (directory: string, app: App): Promise<void> => {
    const directoryExists = await app.vault.adapter.exists(directory);
    if (directoryExists) return;

    await app.vault.createFolder(directory);
};

const createFileIfNonExistent = async (filePath: string, app: App): Promise<void> => {
    const fileExists = await app.vault.adapter.exists(filePath);
    if (fileExists) return;

    await app.vault.create(filePath, '');
};

export { getLinesFromActiveFile, getActiveFile, createDirectoryIfNonExistent, createFileIfNonExistent };

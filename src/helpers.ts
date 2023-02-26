import { App, TFile } from 'obsidian';

const getActiveFile = (app: App): TFile => {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        throw Error('No active file');
    }

    return activeFile;
};

const getLinesFromActiveNote = async (app: App): Promise<string[]> => {
    const activeFile = getActiveFile(app);

    // TODO: Potentially do a non cachedRead here
    const fileStr = await app.vault.cachedRead(activeFile);
    return fileStr.split('\n');
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

export { getLinesFromActiveNote, getActiveFile, createDirectoryIfNonExistent, createFileIfNonExistent };

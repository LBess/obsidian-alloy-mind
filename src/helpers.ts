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

export { getLinesFromActiveNote, getActiveFile };

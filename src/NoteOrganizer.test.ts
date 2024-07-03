import '@testing-library/jest-dom';

import { DateTime } from 'luxon';
import { NoteOrganizer } from './NoteOrganizer';
import { AlloyMindSettingsFactory } from './test/factories/AlloyMindSettingsFactory';
import { AppFactory } from './test/factories/AppFactory';
import { TFileFactory } from './test/factories/TFileFactory';
import { VaultFactory } from './test/factories/VaultFactory';
import { getDateFromISO } from './utils/stringUtils';
import { TFolderFactory } from './test/factories/TFolderFactory';

describe('NoteOrganizer', () => {
    const dailyNoteFolderName = 'Daily Notes';
    const settings = AlloyMindSettingsFactory.create({ dailyNoteFolder: dailyNoteFolderName });

    it('returns the correct number of notes when getUnorganizedNotes is called', async () => {
        const dailyNoteFolder = TFolderFactory.create({ path: dailyNoteFolderName })
        const markdownFiles = [
            TFileFactory.create({ basename: '2024-03-12', parent: dailyNoteFolder }),
            TFileFactory.create({ basename: '2024-06-23', parent: dailyNoteFolder }),
        ];
        const getMarkdownFiles = jest.fn().mockReturnValue(markdownFiles);
        const vault = VaultFactory.create({ getMarkdownFiles });

        const noteOrganizer = new NoteOrganizer(vault, settings);
        const unorganizedNotes = await noteOrganizer.getUnorganizedNotes();

        expect(unorganizedNotes).toHaveLength(2);
    });

    it("does not return today's note when getUnorganizedNotes is called", async () => {
        const dailyNoteFolder = TFolderFactory.create({ path: dailyNoteFolderName })
        const today = getDateFromISO(DateTime.now().toISO());
        const markdownFiles = [
            TFileFactory.create({ basename: today, parent: dailyNoteFolder }),
        ];
        const getMarkdownFiles = jest.fn().mockReturnValue(markdownFiles);
        const vault = VaultFactory.create({ getMarkdownFiles });

        const noteOrganizer = new NoteOrganizer(vault, settings);
        const unorganizedNotes = await noteOrganizer.getUnorganizedNotes();

        expect(unorganizedNotes).toHaveLength(0);
    });

    it('does not return notes not in the daily not root folder', async () => {
        const markdownFiles = [
            TFileFactory.create({ basename: '2024-06-24' }),
        ];
        const getMarkdownFiles = jest.fn().mockReturnValue(markdownFiles);
        const vault = VaultFactory.create({ getMarkdownFiles });

        const noteOrganizer = new NoteOrganizer(vault, settings);
        const unorganizedNotes = await noteOrganizer.getUnorganizedNotes();

        expect(unorganizedNotes).toHaveLength(0);
    });

    // copy dreams to journal tests

    //

    it('calls vault.rename once for each note passed in to moveNotesToWeekFolder', async () => {
        const rename = jest.fn();
        const vault = VaultFactory.create({ rename });

        const notes = [
            TFileFactory.create({ basename: '2024-06-23' }),
            TFileFactory.create({ basename: '2024-06-24' }),
        ];

        const noteOrganizer = new NoteOrganizer(vault, settings);
        await noteOrganizer.moveNotesToWeekFolder(notes);

        expect(rename).toHaveBeenCalledTimes(notes.length);
    });

    it('does not call vault.rename once if there are no notes passed in to moveNotesToWeekFolder', async () => {
        const rename = jest.fn();
        const vault = VaultFactory.create({ rename });

        const noteOrganizer = new NoteOrganizer(vault, settings);
        await noteOrganizer.moveNotesToWeekFolder([]);

        expect(rename).not.toHaveBeenCalled();
    });

});

import { DateTime } from 'luxon';
import { NoteOrganizer } from 'NoteOrganizer';
import { AlloyMindSettingsFactory } from 'test/factories/AlloyMindSettingsFactory';
import { TFileFactory } from 'test/factories/TFileFactory';
import { VaultFactory } from 'test/factories/VaultFactory';
import {
    buildDreamEntry,
    buildDreamEntryTitle,
    buildDreamJournalName,
    buildPath,
    getDateFromISO
} from 'utils/stringUtils';
import { TFolderFactory } from 'test/factories/TFolderFactory';
import { mockObsidianUtils } from 'test/mocks/mockObsidianUtils';

describe('NoteOrganizer', () => {
    const dailyNoteFolderName = 'Daily Notes';
    const settings = AlloyMindSettingsFactory.create({ dailyNoteFolder: dailyNoteFolderName });

    it('returns the correct number of notes when getUnorganizedNotes is called', async () => {
        const markdownFiles = [
            TFileFactory.create({ basename: '2024-03-12' }),
            TFileFactory.create({ basename: '2024-06-23' })
        ];
        const dailyNoteFolder = TFolderFactory.create({ path: dailyNoteFolderName, children: markdownFiles });
        const getFolderByPath = jest.fn().mockReturnValue(dailyNoteFolder);
        const vault = VaultFactory.create({ getFolderByPath });
        mockObsidianUtils();

        const noteOrganizer = new NoteOrganizer(vault, settings);
        const unorganizedNotes = await noteOrganizer.getUnorganizedNotes();

        expect(unorganizedNotes).toHaveLength(2);
    });

    it("does not return today's note when getUnorganizedNotes is called", async () => {
        const today = getDateFromISO(DateTime.now().toISO());
        const markdownFiles = [TFileFactory.create({ basename: today })];
        const dailyNoteFolder = TFolderFactory.create({ path: dailyNoteFolderName, children: markdownFiles });
        const getFolderByPath = jest.fn().mockReturnValue(dailyNoteFolder);
        const vault = VaultFactory.create({ getFolderByPath });
        mockObsidianUtils();

        const noteOrganizer = new NoteOrganizer(vault, settings);
        const unorganizedNotes = await noteOrganizer.getUnorganizedNotes();

        expect(unorganizedNotes).toHaveLength(0);
    });

    it('calls vault.adapter.append with the correct arguments when copyDreamsToJournal is called', async () => {
        const note = TFileFactory.create({ basename: '2024-06-24' });
        const dreamSectionLines = ['Last night I dreamed of a sea of clouds'];
        const noteLines = [note.basename, settings.dreamSection, ...dreamSectionLines];

        const getLinesFromFile = jest.fn().mockReturnValue(noteLines);
        mockObsidianUtils({ getLinesFromFile });

        const vault = VaultFactory.create();
        const noteOrganizer = new NoteOrganizer(vault, settings);
        await noteOrganizer.copyDreamsToJournal(note);

        const dreamEntryTitle = buildDreamEntryTitle(note);
        const dreamEntry = buildDreamEntry(dreamEntryTitle, dreamSectionLines);
        const dreamJournalName = buildDreamJournalName('2024');
        const dreamJournalPath = buildPath(settings.dreamJournalFolder, dreamJournalName, '.md');

        expect(vault.adapter.append).toHaveBeenCalledTimes(1);
        expect(vault.adapter.append).toHaveBeenCalledWith(dreamJournalPath, dreamEntry);
    });

    it('does not call vault.adapter.append when copyDreamsToJournal is called and there is no dream section', async () => {
        const note = TFileFactory.create({ basename: '2024-06-24' });
        const noteLines = [note.basename];

        const getLinesFromFile = jest.fn().mockReturnValue(noteLines);
        mockObsidianUtils({ getLinesFromFile });

        const vault = VaultFactory.create();
        const noteOrganizer = new NoteOrganizer(vault, settings);
        await noteOrganizer.copyDreamsToJournal(note);

        expect(vault.adapter.append).not.toHaveBeenCalled();
    });

    it('does not call vault.adapter.append when copyDreamsToJournal is called and there is a dream section but it is empty', async () => {
        const note = TFileFactory.create({ basename: '2024-06-24' });
        const noteLines = [note.basename, settings.dreamSection];

        const getLinesFromFile = jest.fn().mockReturnValue(noteLines);
        mockObsidianUtils({ getLinesFromFile });

        const vault = VaultFactory.create();
        const noteOrganizer = new NoteOrganizer(vault, settings);
        await noteOrganizer.copyDreamsToJournal(note);

        expect(vault.adapter.append).not.toHaveBeenCalled();
    });

    it('calls vault.rename once for each note passed in to moveNotesToWeekFolder', async () => {
        const rename = jest.fn();
        const vault = VaultFactory.create({ rename });

        const notes = [
            TFileFactory.create({ basename: '2024-06-23' }),
            TFileFactory.create({ basename: '2024-06-24' })
        ];

        const noteOrganizer = new NoteOrganizer(vault, settings);
        await noteOrganizer.moveNotesToWeekFolder(notes);

        expect(rename).toHaveBeenCalledTimes(notes.length);
    });

    it('does not call vault.rename if there are no notes passed in to moveNotesToWeekFolder', async () => {
        const rename = jest.fn();
        const vault = VaultFactory.create({ rename });

        const noteOrganizer = new NoteOrganizer(vault, settings);
        await noteOrganizer.moveNotesToWeekFolder([]);

        expect(rename).not.toHaveBeenCalled();
    });
});

import { AlloyMindSettings } from 'main';

export class AlloyMindSettingsFactory {
    static create(settings?: Partial<AlloyMindSettings>): AlloyMindSettings {
        return {
            dailyNoteFolder: settings?.dailyNoteFolder ?? '',
            dreamJournalFolder: settings?.dreamJournalFolder ?? '',
            dreamSection: settings?.dreamSection ?? '',
        }
    }
}

import { strings } from 'strings/strings';
import { AlloyMindSettings } from 'types/AlloyMindSettings';
import { Constants } from 'utils/Constants';

const settingsStrings = strings.settings.default;

export const DEFAULT_SETTINGS: AlloyMindSettings = {
    dailyNoteFolder: settingsStrings.dailyNoteFolder,
    dreamJournalFolder: settingsStrings.dreamJournalFolder,
    dreamSection: strings.formatString(settingsStrings.dreamSection, Constants.SUBSECTION_PREFIX) as string
};

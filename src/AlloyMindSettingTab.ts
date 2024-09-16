import { App, PluginSettingTab, Setting } from 'obsidian';
import AlloyMindPlugin from 'AlloyMindPlugin';
import { strings } from 'strings/strings';

const settingsStrings = strings.settings;

export class AlloyMindSettingTab extends PluginSettingTab {
    plugin: AlloyMindPlugin;

    constructor(app: App, plugin: AlloyMindPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: settingsStrings.title });
        new Setting(containerEl)
            .setName(settingsStrings.dailyNote.name)
            .setDesc(settingsStrings.dailyNote.description)
            .addText((text) =>
                text
                    .setPlaceholder(settingsStrings.dailyNote.placeHolder)
                    .setValue(this.plugin.settings.dailyNoteFolder)
                    .onChange(async (folder) => {
                        this.plugin.settings.dailyNoteFolder = folder;
                        this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName(settingsStrings.dreamJournal.name)
            .setDesc(settingsStrings.dreamJournal.description)
            .addText((text) =>
                text
                    .setPlaceholder(settingsStrings.dreamJournal.placeHolder)
                    .setValue(this.plugin.settings.dreamJournalFolder)
                    .onChange(async (folder) => {
                        this.plugin.settings.dreamJournalFolder = folder;
                        this.plugin.saveSettings();
                    })
            );
        containerEl.createEl('h2', { text: settingsStrings.description.title });
        containerEl.createEl('p', { text: settingsStrings.description.body });
    }
}

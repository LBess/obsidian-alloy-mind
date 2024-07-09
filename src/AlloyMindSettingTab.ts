import { App, PluginSettingTab, Setting } from 'obsidian';
import AlloyMindPlugin from 'AlloyMindPlugin';

export class AlloyMindSettingTab extends PluginSettingTab {
    plugin: AlloyMindPlugin;

    constructor(app: App, plugin: AlloyMindPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for Alloy Mind' });
        new Setting(containerEl)
            .setName('Daily Note Folder')
            .setDesc(
                'The root folder for your daily notes. e.g. If it is a folder called "Daily Notes", then this setting should be "Daily Notes" no quotations.'
            )
            .addText((text) =>
                text
                    .setPlaceholder('Enter the Folder')
                    .setValue(this.plugin.settings.dailyNoteFolder)
                    .onChange(async (folder) => {
                        this.plugin.settings.dailyNoteFolder = folder;
                        this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName('Dream Journal Folder')
            .setDesc('The root folder for your yearly dream journals.')
            .addText((text) =>
                text
                    .setPlaceholder('Enter the Folder')
                    .setValue(this.plugin.settings.dreamJournalFolder)
                    .onChange(async (folder) => {
                        this.plugin.settings.dreamJournalFolder = folder;
                        this.plugin.saveSettings();
                    })
            );
        containerEl.createEl('h2', { text: 'Description' });
        containerEl.createEl('p', {
            text: 'This is a custom Obsidian plugin I created to help with my usage of the app.'
        });
    }
}

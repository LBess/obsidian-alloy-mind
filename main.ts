import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault } from 'obsidian';
import { readFileSync } from 'fs';

interface TimeEntryTurnerSettings {
}

const DEFAULT_SETTINGS: TimeEntryTurnerSettings = {
}

interface TimeEntry {
	start: string,
	end: string
}

export default class TimeEntryTurnerPlugin extends Plugin {
	settings: TimeEntryTurnerSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new TimeEntryTurnerSettingTab(this.app, this));

		this.addCommand({
			'id': 'calculate-time',
			'name': 'Calculate Time',
			callback: () => this.calculateTimeFromActiveNote()
		});

		this.addRibbonIcon('wand', 'Add up time entries', (evt: MouseEvent) => {
			this.calculateTimeFromActiveNote();
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async calculateTimeFromActiveNote() {
		let activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			return;
		}

		// TODO: Potentially do a non cachedRead here
		let fileStr = await this.app.vault.cachedRead(activeFile);
		let fileLines = fileStr.split('\n');

		let timeEntries: TimeEntry[] = [];
		for (let i = 0; i < fileLines.length; i++) {
			let line = fileLines[i];
			if (!line) {
				continue;
			}

			let times = this.getTimesFromRow(line);
			if (times.length == 2) {
				let timeEntry: TimeEntry = {
					start: times[0],
					end: times[1]
				}
				console.log(times[0] + ", " + times[1]);
				timeEntries.push(timeEntry);
			}
		}

		let totalTime = 0;
		for (let i = 0; i < timeEntries.length; i++) {
			let hours = this.calculateTimeInHours(timeEntries[i]);
			console.log(hours + "h");
			totalTime += hours;
		}

		new Notice('Total time calculated: ' + totalTime + ' hours');
		console.log('Total time calculated: ' + totalTime + ' hours');
	}

	private getTimesFromRow(row: string) {
		if (row.match(/[0-2]?[0-9]:?[0-5][0-9]\ ?-\ ?[0-2]?[0-9]:?[0-5][0-9]/) == null) {
			return [];
		}

		let times = [];
		let it = row.matchAll(/[0-2]?[0-9]:?[0-5][0-9]/g);
		let match = it.next();
		while (!match.done) {
			let time = match.value.first();
			if (!time || times.length == 2) {
				match = it.next();
				continue;
			}

			time = time.replace(':', '');
			times.push(time);

			match = it.next();
		}

		return times;
	}

	private calculateTimeInHours(timeEntry: TimeEntry) {
		let startTimeHour = 0;
		let startTimeMinute = 0;
		if (timeEntry.start.length == 3) {
			startTimeHour = Number(timeEntry.start.substring(0, 1));
			startTimeMinute = Number(timeEntry.start.substring(1, 3));
		}
		else {
			startTimeHour = Number(timeEntry.start.substring(0, 2));
			startTimeMinute = Number(timeEntry.start.substring(2, 4));
		}

		let endTimeHour = 0;
		let endTimeMinute = 0;
		if (timeEntry.end.length == 3) {
			endTimeHour = Number(timeEntry.end.substring(0, 1));
			endTimeMinute = Number(timeEntry.end.substring(1, 3));
		}
		else {
			endTimeHour = Number(timeEntry.end.substring(0, 2));
			endTimeMinute = Number(timeEntry.end.substring(2, 4));
		}

		if (endTimeHour < startTimeHour) {
			// e.g. 11:00 - 1:30
			endTimeHour += 12;
		}

		return (endTimeHour - startTimeHour) + ((endTimeMinute - startTimeMinute) / 60);
	}

}

class TimeEntryTurnerSettingTab extends PluginSettingTab {
	plugin: TimeEntryTurnerPlugin;

	constructor(app: App, plugin: TimeEntryTurnerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", {text: "Settings for Time Entry Turner"});
	}
}

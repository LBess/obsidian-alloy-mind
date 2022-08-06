import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault } from 'obsidian';

interface TimeEntryTurnerSettings {
	dailyNoteDirectory: string;
}

const DEFAULT_SETTINGS: TimeEntryTurnerSettings = {
	dailyNoteDirectory: "Daily Notes"
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

		this.addRibbonIcon('sync', 'Organize daily notes', (evt: MouseEvent) => {
			this.moveDailyNotesToTheirWeekDirectory();
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

	private async moveDailyNotesToTheirWeekDirectory() {
		let allFiles = this.app.vault.getMarkdownFiles();
		let filesToMove = []
		for (let i = 0; i < allFiles.length; i++) {
			let file = allFiles[i];
			if (file.parent.name != this.settings.dailyNoteDirectory) {
				continue;
			}

			filesToMove.push(file);
		}

		for (let i = 0; i < filesToMove.length; i++) {
			let file = filesToMove[i];
			let weekName = this.getWeekNameFromDate(file.basename);
			let newPath = this.settings.dailyNoteDirectory + "/" + weekName;

			console.log("Moving " + file.name);
			let directoryExists: boolean = await this.app.vault.adapter.exists(newPath);
			if (directoryExists) {
				this.app.vault.rename(file, newPath + "/" + file.name);
			}
			else {
				console.log("Creating directory " + newPath);
				this.app.vault.createFolder(newPath).then(() => {
					this.app.vault.rename(file, newPath + "/" + file.name);
				}).catch((error: Error) => {
					if (error.message == "Folder already exists.") {
						this.app.vault.rename(file, newPath + "/" + file.name);
					}
				});
			}
		}
	}

	private async calculateTimeFromActiveNote() {
		let activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			return;
		}

		// TODO: Potentially do a non cachedRead here
		let fileStr: string = await this.app.vault.cachedRead(activeFile);
		let fileLines: string[] = fileStr.split('\n');

		let timeEntries: TimeEntry[] = [];
		for (let i = 0; i < fileLines.length; i++) {
			let line: string = fileLines[i];
			if (!line) {
				continue;
			}

			let times: string[] = this.getTimesFromRow(line);
			if (times.length == 2) {
				let timeEntry: TimeEntry = {
					start: times[0],
					end: times[1]
				}
				console.log(times[0] + ", " + times[1]);
				timeEntries.push(timeEntry);
			}
		}

		let totalTime: number = 0;
		for (let i = 0; i < timeEntries.length; i++) {
			let hours: number = this.calculateTimeInHours(timeEntries[i]);
			totalTime += hours;
			console.log(hours + "h");
		}

		new Notice("Total time calculated: " + totalTime.toFixed(2) + " hours");
		console.log("Total time calculated: " + totalTime.toFixed(2) + " hours");
	}

	private getWeekNameFromDate(dateStr: string): string {
		// date is YYYY-MM-DD
		let date: Date = new Date(dateStr);
		let firstDayOfWeek: Date = new Date(date);
		// date.getDay() is the day of the week, [0-6] inclusive
		// date.getDate() is the day of the month, so [0-27/28/29/30] depending on the month
		firstDayOfWeek.setDate(date.getDate() - date.getDay() - 1);
		let lastDayOfWeek: Date = new Date(date);
		lastDayOfWeek.setDate(date.getDate() - date.getDay() + 5);

		let weekName: string = firstDayOfWeek.getFullYear() + " " + firstDayOfWeek.toISOString().substring(5, 10) + " thru " + lastDayOfWeek.toISOString().substring(5, 10);
		console.log(dateStr + ": " + weekName);
		// YYYY MM-DD thru MM-DD
		// TODO: Allow for the user to change this format
		// TODO: Allow for option for Weekdays only?
		return weekName;
	}

	private getTimesFromRow(row: string): string[] {
		if (row.match(/[0-2]?[0-9]:?[0-5][0-9]\ ?-\ ?[0-2]?[0-9]:?[0-5][0-9]/) == null) {
			return [];
		}

		let times: string[] = [];
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

	private calculateTimeInHours(timeEntry: TimeEntry): number {
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
		new Setting(containerEl)
				.setName("Daily Note Root Directory")
				.setDesc("The root directory for your daily notes. e.g. If it is a directory called \"Daily Notes\", then this setting should be \"Daily Notes\" no quotations.")
				.addText(text => text
					.setPlaceholder("Enter the directory")
					.setValue(this.plugin.settings.dailyNoteDirectory)
					.onChange(async (value) => {
						let directory: string = value;
						this.plugin.settings.dailyNoteDirectory = directory;
						this.plugin.saveSettings();
					})
				)
	}
}

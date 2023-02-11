import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface TimeEntryTurnerSettings {
	dailyNoteDirectory: string;
}

const DEFAULT_SETTINGS: TimeEntryTurnerSettings = {
	dailyNoteDirectory: 'Daily Notes'
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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async moveDailyNotesToTheirWeekDirectory() {
		const allFiles = this.app.vault.getMarkdownFiles();
		const filesToMove = allFiles.filter(file => file.parent.path === this.settings.dailyNoteDirectory);

		filesToMove.forEach(async file => {
			const weekName = this.getWeekNameFromDate(file.basename);
			if (!weekName) {
				return;
			}

			const directory = `${this.settings.dailyNoteDirectory}/${weekName}`;
			const newPath = `${directory}/${file.name}`;

			try {
				const directoryExists = await this.app.vault.adapter.exists(directory);
				if (!directoryExists) {
					await this.app.vault.createFolder(directory);
				}

				await this.app.vault.rename(file, newPath);

			} catch (error) {
				console.error(error);
				if (error.message === 'Folder already exists') {
					await this.app.vault.rename(file, newPath);
				}
			}
		})
	}

	private async calculateTimeFromActiveNote() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			return;
		}

		// TODO: Potentially do a non cachedRead here
		const fileStr: string = await this.app.vault.cachedRead(activeFile);
		const fileLines: string[] = fileStr.split('\n');

		const timeEntries: TimeEntry[] = [];
		fileLines.forEach(line => {
			if (!line) {
				return;
			}

			const times: string[] = this.getTimesFromRow(line);
			if (times.length == 2) {
				const timeEntry: TimeEntry = {
					start: times[0],
					end: times[1]
				}
				timeEntries.push(timeEntry);
			}
		});

		let totalTime = 0;
		timeEntries.forEach(timeEntry => {
			const hours = this.calculateTimeInHours(timeEntry);
			totalTime += hours;
		});

		new Notice(`Total time calculated: ${totalTime.toFixed(2)} hours`);
	}

	private getWeekNameFromDate(dateStr: string): string | undefined {
		if (isNaN(Date.parse(dateStr))) {
			console.warn(`${dateStr} is not a valid date string`);
			return undefined;
		}
		const date = new Date(dateStr);
		const firstDayOfWeek = new Date(date);
		// date.getDay() is the day of the week, [0-6] inclusive
		// date.getDate() is the day of the month, so [0-27/28/29/30] depending on the month
		firstDayOfWeek.setDate(date.getDate() - date.getDay() - 1);
		const lastDayOfWeek = new Date(date);
		lastDayOfWeek.setDate(date.getDate() - date.getDay() + 5);

		const weekName = `${firstDayOfWeek.getFullYear()} ${firstDayOfWeek.toISOString().substring(5, 10)} thru ${lastDayOfWeek.toISOString().substring(5, 10)}`;
		// YYYY MM-DD thru MM-DD
		// TODO: Allow for the user to change this format
		// TODO: Allow for option for Weekdays only?
		return weekName;
	}

	private getTimesFromRow(row: string): string[] {
		if (row.match(/[0-2]?[0-9]:?[0-5][0-9]\ ?-\ ?[0-2]?[0-9]:?[0-5][0-9]/) == null) {
			return [];
		}

		const times: string[] = [];
		const it = row.matchAll(/[0-2]?[0-9]:?[0-5][0-9]/g);
		let match = it.next();
		while (!match.done) {
			let time = match.value.first();
			if (!time || times.length === 2) {
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
		if (timeEntry.start.length === 3) {
			startTimeHour = Number(timeEntry.start.substring(0, 1));
			startTimeMinute = Number(timeEntry.start.substring(1, 3));
		}
		else {
			startTimeHour = Number(timeEntry.start.substring(0, 2));
			startTimeMinute = Number(timeEntry.start.substring(2, 4));
		}

		let endTimeHour = 0;
		let endTimeMinute = 0;
		if (timeEntry.end.length === 3) {
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
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings for Time Entry Turner'});
		new Setting(containerEl)
				.setName('Daily Note Root Directory')
				.setDesc('The root directory for your daily notes. e.g. If it is a directory called "Daily Notes", then this setting should be "Daily Notes" no quotations.')
				.addText(text => text
					.setPlaceholder('Enter the directory')
					.setValue(this.plugin.settings.dailyNoteDirectory)
					.onChange(async directory => {
						this.plugin.settings.dailyNoteDirectory = directory;
						this.plugin.saveSettings();
					})
				)
	}
}

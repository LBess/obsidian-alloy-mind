import { DateTime } from 'luxon';
import { App, Notice, TFile } from 'obsidian';
import { getActiveFile, getLinesFromFile, NoActiveFileError } from 'utils/obsidianUtils';
import { getMonthAndDayFromISO } from 'utils/stringUtils';

interface TimeEntry {
    start: string;
    end: string;
}

export const calculateTimeFromActiveFile = async (app: App) => {
    let fileLines: string[] = [];
    try {
        const activeFile = getActiveFile(app.workspace);
        fileLines = await getLinesFromFile(activeFile, app.vault);
    } catch (error) {
        console.warn(error);
        if (error instanceof NoActiveFileError) {
            new Notice('No active file');
        }
        return;
    }

    const timeEntries: TimeEntry[] = [];
    fileLines.forEach((line) => {
        if (!line) return;

        const times: string[] = getTimesFromRow(line);
        if (times.length === 2) {
            const timeEntry: TimeEntry = {
                start: times[0],
                end: times[1]
            };
            timeEntries.push(timeEntry);
        }
    });

    let totalTime = 0;
    timeEntries.forEach((timeEntry) => {
        const hours = calculateTimeInHours(timeEntry);
        totalTime += hours;
    });

    new Notice(`${totalTime.toFixed(2)} hours`);
};

export const getWeekNameFromDate = (dateStr: string): string => {
    const date = DateTime.fromISO(dateStr);
    if (date.invalidReason) {
        throw Error(`${dateStr} is not a valid date string`);
    }
    // Note that weeks start on Mondays
    const year = date.startOf('week').year;
    const startOfWeek = date.startOf('week').toISO() ?? '';
    const endOfWeek = date.endOf('week').toISO() ?? '';

    // YYYY MM-DD thru MM-DD
    const weekName = `${year} ${getMonthAndDayFromISO(startOfWeek)} thru ${getMonthAndDayFromISO(endOfWeek)}`;
    return weekName;
};

export const getTimesFromRow = (row: string): string[] => {
    if (row.match(/[0-2]?[0-9]:?[0-5][0-9] ?- ?[0-2]?[0-9]:?[0-5][0-9]/) === null) {
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
};

export const calculateTimeInHours = (timeEntry: TimeEntry): number => {
    let startTimeHour = 0;
    let startTimeMinute = 0;
    if (timeEntry.start.length === 3) {
        startTimeHour = Number(timeEntry.start.substring(0, 1));
        startTimeMinute = Number(timeEntry.start.substring(1, 3));
    } else {
        startTimeHour = Number(timeEntry.start.substring(0, 2));
        startTimeMinute = Number(timeEntry.start.substring(2, 4));
    }

    let endTimeHour = 0;
    let endTimeMinute = 0;
    if (timeEntry.end.length === 3) {
        endTimeHour = Number(timeEntry.end.substring(0, 1));
        endTimeMinute = Number(timeEntry.end.substring(1, 3));
    } else {
        endTimeHour = Number(timeEntry.end.substring(0, 2));
        endTimeMinute = Number(timeEntry.end.substring(2, 4));
    }

    if (endTimeHour < startTimeHour) {
        // e.g. 11:00 - 1:30
        endTimeHour += 12;
    }

    return endTimeHour - startTimeHour + (endTimeMinute - startTimeMinute) / 60;
};

export const compareDatesAscending = (noteA: TFile, noteB: TFile) => {
    const dateA = DateTime.fromISO(noteA.basename);
    const dateB = DateTime.fromISO(noteB.basename);

    if (dateA < dateB) {
        return -1;
    } else if (dateA > dateB) {
        return 1;
    } else {
        return 0;
    }
};

import { App, Notice } from 'obsidian';
import { getLinesFromActiveNote } from './helpers';

interface TimeEntry {
    start: string;
    end: string;
}

const calculateTimeFromActiveNote = async (app: App) => {
    const fileLines = await getLinesFromActiveNote(app);

    const timeEntries: TimeEntry[] = [];
    fileLines.forEach((line) => {
        if (!line) {
            return;
        }

        const times: string[] = getTimesFromRow(line);
        if (times.length == 2) {
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

    new Notice(`Total time calculated: ${totalTime.toFixed(2)} hours`);
};

const getWeekNameFromDate = (dateStr: string): string | undefined => {
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

    const weekName = `${firstDayOfWeek.getFullYear()} ${firstDayOfWeek
        .toISOString()
        .substring(5, 10)} thru ${lastDayOfWeek.toISOString().substring(5, 10)}`;
    // YYYY MM-DD thru MM-DD
    // TODO: Allow for the user to change this format
    // TODO: Allow for option for Weekdays only?
    return weekName;
};

const getTimesFromRow = (row: string): string[] => {
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

const calculateTimeInHours = (timeEntry: TimeEntry): number => {
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

export { calculateTimeFromActiveNote, getWeekNameFromDate, getTimesFromRow, calculateTimeInHours };

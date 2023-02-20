import { DateTime } from 'luxon';
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

const getWeekNameFromDate = (dateStr: string): string => {
    const date = DateTime.fromISO(dateStr);
    if (date.invalidReason) {
        throw Error(`${dateStr} is not a valid date string`);
    }
    // Note that weeks start on Mondays
    const startOfWeek = date.startOf('week');
    const endOfWeek = date.endOf('week');

    // YYYY MM-DD thru MM-DD
    const weekName = `${startOfWeek.year} ${startOfWeek.toISO().substring(5, 10)} thru ${endOfWeek
        .toISO()
        .substring(5, 10)}`;
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

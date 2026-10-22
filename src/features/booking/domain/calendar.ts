import type { CalendarCell } from "./types";
import { MONTHS } from "./constants";

export function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function formatMonthLabel(year: number, month: number): string {
    return `${MONTHS[month]} ${year}`;
}

export function isCurrentMonth(today: Date, year: number, month: number) {
    return year === today.getFullYear() && month === today.getMonth();
}

/** Returns the previous/next {year, month}, wrapping around the year. */
export function shiftMonth(year: number, month: number, delta: 1 | -1) {
    const next = month + delta;
    if (next < 0) return { year: year - 1, month: 11 };
    if (next > 11) return { year: year + 1, month: 0 };
    return { year, month: next };
}

/**
 * Builds the month grid (Monday-first), padded with days of adjacent months
 * so the number of cells is a multiple of 7. Past days are muted.
 */
export function buildMonthGrid(
    year: number,
    month: number,
    today: Date,
): CalendarCell[] {
    const todayStart = startOfDay(today);
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        cells.push({ key: `prev-${day}`, day, muted: true, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = startOfDay(new Date(year, month, d));
        const isPast = cellDate < todayStart;
        cells.push({
            key: `day-${d}`,
            day: d,
            muted: isPast,
            isToday: cellDate.getTime() === todayStart.getTime(),
            iso: isPast ? undefined : cellDate.toISOString(),
        });
    }

    const totalCells = startOffset + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let n = 1; n <= remaining; n++) {
        cells.push({ key: `next-${n}`, day: n, muted: true, isToday: false });
    }

    return cells;
}

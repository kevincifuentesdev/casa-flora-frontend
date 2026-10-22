"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import {
    buildMonthGrid,
    formatMonthLabel,
    isCurrentMonth,
    shiftMonth,
    startOfDay,
} from "../domain/calendar";

/**
 * Calendar view state. `today` is resolved after mount to avoid
 * server/client timezone hydration mismatches; cells are empty until then.
 */
export function useCalendar() {
    const [today, setToday] = useState<Date | null>(null);
    const [view, setView] = useState<{ year: number; month: number } | null>(
        null,
    );

    useEffect(() => {
        const now = startOfDay(new Date());
        startTransition(() => {
            setToday(now);
            setView({ year: now.getFullYear(), month: now.getMonth() });
        });
    }, []);

    const cells = useMemo(
        () => (today && view ? buildMonthGrid(view.year, view.month, today) : []),
        [today, view],
    );

    const monthLabel = view ? formatMonthLabel(view.year, view.month) : "";
    const canGoPrev =
        !!today && !!view && !isCurrentMonth(today, view.year, view.month);

    function goPrev() {
        setView((v) => (v && canGoPrev ? shiftMonth(v.year, v.month, -1) : v));
    }

    function goNext() {
        setView((v) => (v ? shiftMonth(v.year, v.month, 1) : v));
    }

    return { cells, monthLabel, canGoPrev, goPrev, goNext };
}

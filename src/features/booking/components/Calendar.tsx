"use client";

import { AngleLeft, AngleRight } from "reicon-react";

import Button from "@/features/common/components/Button";
import { useBookingFormContext } from "../context/BookingFormContext";
import { WEEKDAYS } from "../domain/constants";
import { useCalendar } from "../hooks/useCalendar";
import { FieldError, fieldErrorClasses } from "./FieldError";

const navBtn =
    "size-8 rounded-full! p-0! hover:bg-primary/[0.06]";

export default function Calendar() {
    const { draft, errors, selectDate } = useBookingFormContext();
    const { cells, monthLabel, canGoPrev, goPrev, goNext } = useCalendar();

    return (
        <fieldset className="m-0 border-0 p-0">
            <div className="mb-3 flex items-center justify-between">
                <legend className="mb-0 block text-sm/5 font-bold tracking-wider text-foreground">
                    Fecha
                </legend>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        aria-label="Mes anterior"
                        disabled={!canGoPrev}
                        onClick={goPrev}
                        className={`${navBtn} ${canGoPrev ? "" : "pointer-events-none opacity-30"}`}
                    >
                        <AngleLeft className="size-5" />
                    </Button>
                    <span className="min-w-32 text-center text-base/6 font-bold text-primary">
                        {monthLabel}
                    </span>
                    <Button
                        variant="ghost"
                        aria-label="Mes siguiente"
                        onClick={goNext}
                        className={navBtn}
                    >
                        <AngleRight className="size-5" />
                    </Button>
                </div>
            </div>
            <div
                data-field="date"
                className={`rounded-lg border border-foreground-muted/15 bg-background-alt p-4 shadow-[inset_0_1px_3px_rgb(38_24_20/4%)] dark:border-foreground-muted/10 ${errors.date ? fieldErrorClasses : ""}`}
            >
                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                    {WEEKDAYS.map((d) => (
                        <span
                            key={d}
                            className="text-xs/4 font-semibold tracking-[0.01em] text-foreground-muted"
                        >
                            {d}
                        </span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {cells.map((cell) => {
                        const selected = !!cell.iso && cell.iso === draft.date;
                        return (
                            <button
                                key={cell.key}
                                type="button"
                                disabled={cell.muted}
                                data-date={cell.iso}
                                aria-pressed={cell.iso ? selected : undefined}
                                onClick={() => cell.iso && selectDate(cell.iso)}
                                className={[
                                    "cursor-pointer rounded-lg border-0 p-2 text-base/6 transition duration-200 active:scale-[0.92]",
                                    selected
                                        ? "scale-105 bg-primary font-bold text-primary-foreground shadow-(--shadow-ambient-sm) hover:bg-primary"
                                        : "bg-transparent text-foreground hover:bg-surface",
                                    cell.muted
                                        ? "cursor-default text-foreground-muted opacity-40 hover:bg-transparent active:scale-100"
                                        : "",
                                    cell.isToday
                                        ? "font-bold shadow-[inset_0_0_0_2px_var(--primary)]"
                                        : "",
                                ].join(" ")}
                            >
                                {cell.day}
                            </button>
                        );
                    })}
                </div>
            </div>
            <FieldError field="date" message={errors.date} />
        </fieldset>
    );
}

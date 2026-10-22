export type EnvironmentId = "interior" | "patio";

export type TimeGroupId = "Almuerzo" | "Cena";

export type BookingField = "environment" | "date" | "time" | "diners";

export type EnvironmentOption = {
    value: EnvironmentId;
    label: string;
};

export type TimeSlotGroup = {
    label: TimeGroupId;
    slots: readonly string[];
};

export type BookingDraft = {
    environment: EnvironmentId | null;
    /** ISO string of the selected day (local midnight), or null. */
    date: string | null;
    time: string | null;
    diners: number;
};

export type BookingErrors = Partial<Record<BookingField, string>>;

export type CalendarCell = {
    key: string;
    day: number;
    /** Disabled cells: days of adjacent months and past days. */
    muted: boolean;
    isToday: boolean;
    /** ISO date; only present for selectable days. */
    iso?: string;
};

import type { BookingField, EnvironmentOption, TimeSlotGroup } from "./types";

export const MIN_DINERS = 1;
export const MAX_DINERS = 10;
export const DEFAULT_DINERS = 2;

export const FIELD_ORDER: readonly BookingField[] = [
    "environment",
    "date",
    "time",
    "diners",
];

export const ENVIRONMENTS: readonly EnvironmentOption[] = [
    { value: "interior", label: "Interior" },
    { value: "patio", label: "Patio" },
];

export const TIME_SLOT_GROUPS: readonly TimeSlotGroup[] = [
    { label: "Almuerzo", slots: ["13:00", "14:30"] },
    { label: "Cena", slots: ["19:00", "20:30"] },
];

export const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
] as const;

export const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"] as const;

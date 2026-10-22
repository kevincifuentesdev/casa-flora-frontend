import type { BookingDraft, BookingErrors, BookingField } from "./types";
import { FIELD_ORDER, MAX_DINERS, MIN_DINERS } from "./constants";

export const FIELD_MESSAGES: Record<BookingField, string> = {
    environment: "Selecciona un ambiente.",
    date: "Selecciona una fecha.",
    time: "Selecciona un horario.",
    diners: "Número de comensales inválido.",
};

export function validateField(
    name: BookingField,
    draft: BookingDraft,
): string | null {
    const value = draft[name];
    if (value === null || value === undefined || String(value).trim() === "") {
        return FIELD_MESSAGES[name];
    }
    if (name === "diners") {
        const num = Number(draft.diners);
        if (!Number.isInteger(num) || num < MIN_DINERS || num > MAX_DINERS) {
            return FIELD_MESSAGES[name];
        }
    }
    return null;
}

export function validateBooking(draft: BookingDraft): BookingErrors {
    const errors: BookingErrors = {};
    for (const field of FIELD_ORDER) {
        const message = validateField(field, draft);
        if (message) errors[field] = message;
    }
    return errors;
}

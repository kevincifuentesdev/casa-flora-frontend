"use client";

import { useEffect } from "react";

import { FIELD_ORDER } from "../domain/constants";
import { useBookingFormContext } from "../context/BookingFormContext";

/** Form-level behaviour: exposes the context and scrolls to the first error. */
export function useBookingForm() {
    const ctx = useBookingFormContext();
    const { errors, errorVersion } = ctx;

    useEffect(() => {
        if (errorVersion === 0) return;
        const first = FIELD_ORDER.find((field) => errors[field]);
        if (!first) return;
        document
            .querySelector(`[data-field="${first}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        // Only when a submit yields errors, not when errors are cleared.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorVersion]);

    return ctx;
}

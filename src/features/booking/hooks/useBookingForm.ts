"use client";

import { useEffect } from "react";

import { FIELD_ORDER } from "../domain/constants";
import { useBookingFormContext } from "../context/BookingFormContext";

/** Form-level behaviour: exposes the context and scrolls to the first error. */
export function useBookingForm() {
    const ctx = useBookingFormContext();
    const { errors, errorVersion, submitError, confirmedBooking } = ctx;

    useEffect(() => {
        if (errorVersion === 0) return;
        const first = FIELD_ORDER.find((field) => errors[field]);
        if (first) {
            document
                .querySelector(`[data-field="${first}"]`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (submitError) {
            document
                .getElementById("booking-submit-alert")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // Only when a submit yields errors, not when errors are cleared.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorVersion]);

    useEffect(() => {
        if (!confirmedBooking) return;
        const confirmationEl = document.getElementById("booking-confirmation");
        if (confirmationEl) {
            confirmationEl.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [confirmedBooking]);

    return ctx;
}

"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { DEFAULT_DINERS, MAX_DINERS, MIN_DINERS } from "../domain/constants";
import type {
    BookingDraft,
    BookingErrors,
    BookingField,
    EnvironmentId,
} from "../domain/types";
import { submitBooking } from "../services/bookingService";

type BookingFormContextValue = {
    draft: BookingDraft;
    errors: BookingErrors;
    /** Incremented on every submit that produced errors (used to trigger scroll). */
    errorVersion: number;
    isSubmitting: boolean;
    selectEnvironment: (value: EnvironmentId) => void;
    selectDate: (iso: string) => void;
    selectTime: (value: string) => void;
    changeDiners: (delta: number) => void;
    submit: () => Promise<void>;
};

const BookingFormContext = createContext<BookingFormContextValue | null>(null);

export function BookingFormProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState<BookingDraft>({
        environment: "interior",
        date: null,
        time: null,
        diners: DEFAULT_DINERS,
    });
    const [errors, setErrors] = useState<BookingErrors>({});
    const [errorVersion, setErrorVersion] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearError = useCallback((field: BookingField) => {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const selectEnvironment = useCallback(
        (environment: EnvironmentId) => {
            setDraft((prev) => ({ ...prev, environment }));
            clearError("environment");
        },
        [clearError],
    );

    const selectDate = useCallback(
        (date: string) => {
            setDraft((prev) => ({ ...prev, date }));
            clearError("date");
        },
        [clearError],
    );

    const selectTime = useCallback(
        (time: string) => {
            setDraft((prev) => ({ ...prev, time }));
            clearError("time");
        },
        [clearError],
    );

    const changeDiners = useCallback((delta: number) => {
        setDraft((prev) => ({
            ...prev,
            diners: Math.min(
                MAX_DINERS,
                Math.max(MIN_DINERS, (prev.diners || MIN_DINERS) + delta),
            ),
        }));
    }, []);

    const submit = useCallback(async () => {
        setIsSubmitting(true);
        try {
            const result = await submitBooking(draft);
            if (result.ok) {
                setErrors({});
            } else {
                setErrors(result.errors);
                setErrorVersion((v) => v + 1);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [draft]);

    const value = useMemo(
        () => ({
            draft,
            errors,
            errorVersion,
            isSubmitting,
            selectEnvironment,
            selectDate,
            selectTime,
            changeDiners,
            submit,
        }),
        [
            draft,
            errors,
            errorVersion,
            isSubmitting,
            selectEnvironment,
            selectDate,
            selectTime,
            changeDiners,
            submit,
        ],
    );

    return (
        <BookingFormContext.Provider value={value}>
            {children}
        </BookingFormContext.Provider>
    );
}

export function useBookingFormContext(): BookingFormContextValue {
    const ctx = useContext(BookingFormContext);
    if (!ctx) {
        throw new Error(
            "useBookingFormContext must be used within BookingFormProvider",
        );
    }
    return ctx;
}

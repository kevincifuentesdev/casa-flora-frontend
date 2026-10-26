"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { DEFAULT_DINERS, MAX_DINERS, MIN_DINERS } from "../domain/constants";
import type {
    BookingDraft,
    BookingErrors,
    BookingField,
    BookingRecord,
    EnvironmentId,
    SlotAvailability,
} from "../domain/types";
import {
    fetchBookingAvailability,
    submitBooking,
} from "../services/bookingService";

type BookingFormContextValue = {
    draft: BookingDraft;
    errors: BookingErrors;
    errorVersion: number;
    isSubmitting: boolean;
    submitError: string | null;
    requiresAuth: boolean;
    confirmedBooking: BookingRecord | null;
    slotAvailability: Record<string, SlotAvailability>;
    isLoadingAvailability: boolean;
    availabilityError: string | null;
    selectEnvironment: (value: EnvironmentId) => void;
    selectDate: (iso: string) => void;
    selectTime: (value: string) => void;
    changeDiners: (delta: number) => void;
    submit: () => Promise<void>;
    resetBookingForm: () => void;
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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [requiresAuth, setRequiresAuth] = useState(false);
    const [confirmedBooking, setConfirmedBooking] =
        useState<BookingRecord | null>(null);
    const [slotAvailability, setSlotAvailability] = useState<
        Record<string, SlotAvailability>
    >({});
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!draft.date || !draft.environment) {
            setSlotAvailability({});
            setAvailabilityError(null);
            return;
        }

        let cancelled = false;
        setIsLoadingAvailability(true);
        setAvailabilityError(null);

        fetchBookingAvailability(draft.date, draft.environment)
            .then((slots) => {
                if (cancelled) return;
                const map: Record<string, SlotAvailability> = {};
                for (const slot of slots) {
                    map[slot.time] = slot;
                }
                setSlotAvailability(map);
            })
            .catch(() => {
                if (!cancelled) {
                    setAvailabilityError(
                        "No se pudo verificar la disponibilidad de cupos en tiempo real.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingAvailability(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [draft.date, draft.environment]);

    const clearError = useCallback((field: BookingField) => {
        setSubmitError(null);
        setRequiresAuth(false);
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
        setSubmitError(null);
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
        setSubmitError(null);
        setRequiresAuth(false);
        try {
            const result = await submitBooking(draft);
            if (result.ok) {
                setErrors({});
                setConfirmedBooking(result.booking);
            } else {
                setErrors(result.errors);
                setSubmitError(result.serverError ?? null);
                setRequiresAuth(Boolean(result.requiresAuth));
                if (Object.keys(result.errors).length > 0) {
                    setErrorVersion((v) => v + 1);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [draft]);

    const resetBookingForm = useCallback(() => {
        setConfirmedBooking(null);
        setSubmitError(null);
        setRequiresAuth(false);
        setErrors({});
        setDraft({
            environment: "interior",
            date: null,
            time: null,
            diners: DEFAULT_DINERS,
        });
    }, []);

    const value = useMemo(
        () => ({
            draft,
            errors,
            errorVersion,
            isSubmitting,
            submitError,
            requiresAuth,
            confirmedBooking,
            slotAvailability,
            isLoadingAvailability,
            availabilityError,
            selectEnvironment,
            selectDate,
            selectTime,
            changeDiners,
            submit,
            resetBookingForm,
        }),
        [
            draft,
            errors,
            errorVersion,
            isSubmitting,
            submitError,
            requiresAuth,
            confirmedBooking,
            slotAvailability,
            isLoadingAvailability,
            availabilityError,
            selectEnvironment,
            selectDate,
            selectTime,
            changeDiners,
            submit,
            resetBookingForm,
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

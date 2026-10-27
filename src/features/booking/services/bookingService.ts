import {
    ApiClientError,
    apiRequest,
} from "@/features/common/services/apiClient";
import type {
    BookingDraft,
    BookingErrors,
    BookingRecord,
    EnvironmentId,
    SlotAvailability,
} from "../domain/types";
import { validateBooking } from "../domain/validation";

export type SubmitBookingResult =
    | { ok: true; booking: BookingRecord }
    | {
          ok: false;
          errors: BookingErrors;
          serverError?: string;
          requiresAuth?: boolean;
      };

export async function fetchBookingAvailability(
    date: string,
    environment: EnvironmentId,
): Promise<SlotAvailability[]> {
    const params = new URLSearchParams({ date, environment });
    const response = await apiRequest<{
        data: {
            date: string;
            environment: EnvironmentId;
            slots: SlotAvailability[];
        };
    }>(`/api/bookings/availability?${params.toString()}`);

    return response.data.slots;
}

export async function submitBooking(
    draft: BookingDraft,
): Promise<SubmitBookingResult> {
    const errors = validateBooking(draft);

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    try {
        const response = await apiRequest<{ data: BookingRecord }>(
            "/api/bookings",
            {
                method: "POST",
                body: JSON.stringify({
                    environment: draft.environment,
                    date: draft.date,
                    time: draft.time,
                    diners: draft.diners,
                }),
            },
        );

        return { ok: true, booking: response.data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            if (error.status === 401) {
                return {
                    ok: false,
                    errors: {},
                    requiresAuth: true,
                    serverError:
                        "Inicia sesión en tu cuenta para confirmar la reserva.",
                };
            }

            const fieldErrors: BookingErrors = {};
            if (error.details) {
                for (const key of [
                    "environment",
                    "date",
                    "time",
                    "diners",
                ] as const) {
                    if (error.details[key]) {
                        fieldErrors[key] = error.details[key];
                    }
                }
            }

            if (
                error.code === "BOOKING_CAPACITY_EXCEEDED" ||
                error.code === "BOOKING_ALREADY_EXISTS"
            ) {
                fieldErrors.time = error.message;
            }

            return {
                ok: false,
                errors: fieldErrors,
                serverError: error.message,
            };
        }

        return {
            ok: false,
            errors: {},
            serverError:
                "No fue posible conectar con el servidor de reservas. Intenta nuevamente.",
        };
    }
}

export async function fetchMyBookings(
    query: { page?: number; limit?: number } = {},
): Promise<BookingRecord[]> {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    const qs = params.toString();
    const path = qs ? `/api/bookings/me?${qs}` : "/api/bookings/me";
    const response = await apiRequest<{ data: BookingRecord[] }>(path);
    return response.data;
}

export async function cancelMyBooking(id: string): Promise<BookingRecord> {
    const response = await apiRequest<{ data: BookingRecord }>(
        `/api/bookings/${encodeURIComponent(id)}/cancel`,
        {
            method: "PATCH",
        },
    );
    return response.data;
}

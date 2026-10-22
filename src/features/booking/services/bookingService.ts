import type { BookingDraft, BookingErrors } from "../domain/types";
import { validateBooking } from "../domain/validation";

export type SubmitBookingResult =
    | { ok: true }
    | { ok: false; errors: BookingErrors };

/**
 * Stub: for now it only validates the draft (like the original CTA).
 * Later it should POST the draft to the backend reservations endpoint.
 */
export async function submitBooking(
    draft: BookingDraft,
): Promise<SubmitBookingResult> {
    const errors = validateBooking(draft);

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    // TODO: call the backend (e.g. fetch(`${API_URL}/bookings`, { method: "POST", ... })).
    return { ok: true };
}

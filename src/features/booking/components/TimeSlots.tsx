"use client";

import { useBookingFormContext } from "../context/BookingFormContext";
import { TIME_SLOT_GROUPS } from "../domain/constants";
import { FieldError, fieldErrorClasses } from "./FieldError";

export default function TimeSlots() {
    const {
        draft,
        errors,
        slotAvailability,
        isLoadingAvailability,
        availabilityError,
        selectTime,
    } = useBookingFormContext();

    return (
        <fieldset className="m-0 border-0 p-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <legend className="block text-sm/5 font-bold tracking-[0.05em] text-foreground">
                    Horario
                </legend>
                {isLoadingAvailability && (
                    <span
                        role="status"
                        aria-live="polite"
                        className="text-xs font-semibold text-secondary"
                    >
                        Consultando cupos disponibles...
                    </span>
                )}
            </div>

            {availabilityError && (
                <p
                    role="status"
                    className="m-0 mb-3 text-xs text-foreground-muted"
                >
                    {availabilityError}
                </p>
            )}

            <div
                data-field="time"
                className={`flex flex-col gap-4 ${errors.time ? fieldErrorClasses : ""}`}
            >
                {TIME_SLOT_GROUPS.map((group) => (
                    <div key={group.label}>
                        <p className="m-0 mb-2 text-base/6 text-foreground-muted">
                            {group.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {group.slots.map((slot) => {
                                const info = slotAvailability[slot];
                                const insufficientSeats =
                                    info !== undefined &&
                                    info.remainingDiners < draft.diners;

                                return (
                                    <label key={slot} className="relative">
                                        <input
                                            type="radio"
                                            name="time"
                                            value={slot}
                                            disabled={insufficientSeats}
                                            checked={draft.time === slot}
                                            onChange={() => selectTime(slot)}
                                            className="peer sr-only"
                                        />
                                        <span className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-secondary px-4 py-2 text-base/6 text-secondary transition duration-200 hover:bg-secondary/10 active:scale-95 peer-checked:bg-secondary peer-checked:text-secondary-foreground peer-disabled:cursor-not-allowed peer-disabled:border-border/40 peer-disabled:text-foreground-muted/50 peer-disabled:hover:bg-transparent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-secondary">
                                            <span>{slot}</span>
                                            {info !== undefined && (
                                                <span className="text-xs opacity-85">
                                                    {insufficientSeats
                                                        ? "(Sin cupo)"
                                                        : `(${info.remainingDiners} disp.)`}
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <FieldError field="time" message={errors.time} />
        </fieldset>
    );
}

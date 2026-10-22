"use client";

import { useBookingFormContext } from "../context/BookingFormContext";
import { TIME_SLOT_GROUPS } from "../domain/constants";
import { FieldError, fieldErrorClasses } from "./FieldError";

export default function TimeSlots() {
    const { draft, errors, selectTime } = useBookingFormContext();

    return (
        <fieldset className="m-0 border-0 p-0">
            <legend className="mb-3 block text-sm/5 font-bold tracking-[0.05em] text-foreground">
                Horario
            </legend>
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
                            {group.slots.map((slot) => (
                                <label key={slot} className="relative">
                                    <input
                                        type="radio"
                                        name="time"
                                        value={slot}
                                        checked={draft.time === slot}
                                        onChange={() => selectTime(slot)}
                                        className="peer sr-only"
                                    />
                                    <span className="inline-block cursor-pointer rounded-full border border-secondary px-4 py-2 text-base/6 text-secondary transition duration-200 hover:bg-secondary/10 active:scale-95 peer-checked:bg-secondary peer-checked:text-secondary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-secondary">
                                        {slot}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <FieldError field="time" message={errors.time} />
        </fieldset>
    );
}

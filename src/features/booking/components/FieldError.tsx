import type { BookingField } from "../domain/types";

export const fieldErrorClasses = "rounded-lg ring-2 ring-destructive animate-shake";

export function FieldError({
    field,
    message,
}: {
    field: BookingField;
    message?: string;
}) {
    if (!message) return null;
    return (
        <span
            role="alert"
            data-field-error={field}
            className="mt-2 block animate-error-in text-xs/4 font-semibold tracking-[0.01em] text-destructive"
        >
            {message}
        </span>
    );
}

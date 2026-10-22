export const authFieldErrorClasses =
    "border-destructive! ring-2 ring-destructive/30 animate-shake";

export function AuthFieldError({
    id,
    message,
}: {
    id: string;
    message?: string;
}) {
    if (!message) return null;

    return (
        <span
            id={id}
            role="alert"
            className="mt-1.5 block animate-error-in text-xs/4 font-semibold tracking-[0.01em] text-destructive"
        >
            {message}
        </span>
    );
}


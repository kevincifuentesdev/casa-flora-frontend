"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { validateSignUpField } from "@/features/auth/domain/authValidation";
import type { SignUpDraft } from "@/features/auth/domain/session";
import { useSession } from "@/features/auth/hooks/useSession";
import { updateUserProfile } from "@/features/auth/services/authService";
import type { BookingRecord } from "@/features/booking/domain/types";
import {
    cancelMyBooking,
    fetchMyBookings,
} from "@/features/booking/services/bookingService";
import { ApiClientError } from "@/features/common/services/apiClient";

type ProfileFormDraft = {
    firstName: string;
    lastName: string;
    birthDate: string;
    username: string;
};

type ProfileField = keyof ProfileFormDraft;
type ProfileErrors = Partial<Record<ProfileField, string>>;

const PROFILE_FIELDS: readonly ProfileField[] = [
    "firstName",
    "lastName",
    "birthDate",
    "username",
];

function validateProfileDraft(draft: ProfileFormDraft): ProfileErrors {
    const signUpAdapter: SignUpDraft = {
        ...draft,
        email: "placeholder@casaflora.co",
        password: "placeholderPassword",
    };

    const errors: ProfileErrors = {};
    for (const field of PROFILE_FIELDS) {
        const message = validateSignUpField(field, signUpAdapter);
        if (message) {
            errors[field] = message;
        }
    }
    return errors;
}

function formatEnvironmentLabel(environment: BookingRecord["environment"]): string {
    return environment === "patio" ? "Patio interior" : "Salón principal";
}

export function ProfilePage() {
    const router = useRouter();
    const { session, isLoading: isSessionLoading, logout, refreshSession } =
        useSession();

    const [overrides, setOverrides] = useState<Partial<ProfileFormDraft>>({});
    const [fieldErrors, setFieldErrors] = useState<ProfileErrors>({});
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const draft: ProfileFormDraft = {
        firstName: overrides.firstName ?? session?.user?.firstName ?? "",
        lastName: overrides.lastName ?? session?.user?.lastName ?? "",
        birthDate: overrides.birthDate ?? session?.user?.birthDate ?? "",
        username: overrides.username ?? session?.user?.username ?? "",
    };

    const loadBookings = useCallback(async () => {
        if (!session?.user) {
            setBookings([]);
            setIsLoadingBookings(false);
            return;
        }

        setIsLoadingBookings(true);
        setBookingsError(null);

        try {
            const list = await fetchMyBookings();
            setBookings(list);
        } catch (error) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "No fue posible cargar tus reservas en este momento.";
            setBookingsError(message);
        } finally {
            setIsLoadingBookings(false);
        }
    }, [session?.user]);

    useEffect(() => {
        if (isSessionLoading) {
            return;
        }

        let cancelled = false;

        if (!session?.user) {
            Promise.resolve().then(() => {
                if (!cancelled) {
                    setBookings([]);
                    setIsLoadingBookings(false);
                }
            });
            return () => {
                cancelled = true;
            };
        }

        fetchMyBookings()
            .then((list) => {
                if (!cancelled) {
                    setBookings(list);
                    setBookingsError(null);
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    const message =
                        error instanceof ApiClientError
                            ? error.message
                            : "No fue posible cargar tus reservas en este momento.";
                    setBookingsError(message);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingBookings(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [isSessionLoading, session?.user]);

    const handleFieldChange = (field: ProfileField, value: string) => {
        setOverrides((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        setProfileMessage(null);
        setProfileError(null);
    };

    const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProfileMessage(null);
        setProfileError(null);

        const errors = validateProfileDraft(draft);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsSavingProfile(true);
        const result = await updateUserProfile({
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            birthDate: draft.birthDate,
            username: draft.username.trim(),
        });
        setIsSavingProfile(false);

        if (result.error) {
            setProfileError(result.error);
            return;
        }

        await refreshSession();
        setProfileMessage("Tus datos personales han sido actualizados.");
    };

    const handleCancelBooking = async (bookingId: string) => {
        setCancellingId(bookingId);
        setBookingsError(null);

        try {
            const updated = await cancelMyBooking(bookingId);
            setBookings((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item)),
            );
        } catch (error) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "No fue posible cancelar la reserva seleccionada.";
            setBookingsError(message);
        } finally {
            setCancellingId(null);
        }
    };

    const handleSignOut = async () => {
        await logout();
        router.push("/");
    };

    if (isSessionLoading) {
        return (
            <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <div
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-stone-300/70 bg-surface-card p-8 text-center text-text-muted"
                >
                    Cargando tu perfil y reservas...
                </div>
            </section>
        );
    }

    if (!session?.user) {
        return (
            <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-stone-300/70 bg-surface-card p-8 text-center shadow-sm">
                    <h1 className="font-heading text-3xl font-bold text-text-primary">
                        Tu cuenta en Casa Flora
                    </h1>
                    <p className="mt-3 text-base text-text-secondary">
                        Inicia sesión para consultar tus datos personales y
                        administrar tus reservas de mesa.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/login"
                            className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-primary px-6 py-2.5 text-sm font-semibold text-text-light transition-colors hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            href="/menu"
                            className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-secondary px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                            Explorar el menú
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <header className="flex flex-col gap-4 border-b border-stone-300/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                        Cuenta personal
                    </p>
                    <h1 className="mt-1 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                        Hola, {session.user.firstName || session.user.name}
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        {session.user.email}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex min-h-11 items-center justify-center self-start rounded-md border border-brand-secondary px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:self-auto"
                >
                    Cerrar sesión
                </button>
            </header>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <div className="rounded-xl border border-stone-300/70 bg-surface-card p-6 shadow-sm">
                        <h2 className="font-heading text-2xl font-semibold text-text-primary">
                            Datos personales
                        </h2>
                        <p className="mt-1 text-sm text-text-muted">
                            Mantén tu información al día para agilizar tus
                            reservas en Casa Flora.
                        </p>

                        <form
                            onSubmit={handleProfileSubmit}
                            noValidate
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="profile-firstName"
                                    className="block text-sm font-semibold text-text-primary"
                                >
                                    Nombres
                                </label>
                                <input
                                    id="profile-firstName"
                                    type="text"
                                    value={draft.firstName}
                                    onChange={(event) =>
                                        handleFieldChange(
                                            "firstName",
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={!!fieldErrors.firstName}
                                    className="mt-1.5 w-full min-h-11 rounded-md border border-stone-300 bg-surface-primary px-3.5 py-2 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                                />
                                {fieldErrors.firstName && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-red-800"
                                    >
                                        {fieldErrors.firstName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-lastName"
                                    className="block text-sm font-semibold text-text-primary"
                                >
                                    Apellidos
                                </label>
                                <input
                                    id="profile-lastName"
                                    type="text"
                                    value={draft.lastName}
                                    onChange={(event) =>
                                        handleFieldChange(
                                            "lastName",
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={!!fieldErrors.lastName}
                                    className="mt-1.5 w-full min-h-11 rounded-md border border-stone-300 bg-surface-primary px-3.5 py-2 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                                />
                                {fieldErrors.lastName && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-red-800"
                                    >
                                        {fieldErrors.lastName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-username"
                                    className="block text-sm font-semibold text-text-primary"
                                >
                                    Nombre de usuario
                                </label>
                                <input
                                    id="profile-username"
                                    type="text"
                                    value={draft.username}
                                    onChange={(event) =>
                                        handleFieldChange(
                                            "username",
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={!!fieldErrors.username}
                                    className="mt-1.5 w-full min-h-11 rounded-md border border-stone-300 bg-surface-primary px-3.5 py-2 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                                />
                                {fieldErrors.username && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-red-800"
                                    >
                                        {fieldErrors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-birthDate"
                                    className="block text-sm font-semibold text-text-primary"
                                >
                                    Fecha de nacimiento
                                </label>
                                <input
                                    id="profile-birthDate"
                                    type="date"
                                    value={draft.birthDate}
                                    onChange={(event) =>
                                        handleFieldChange(
                                            "birthDate",
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={!!fieldErrors.birthDate}
                                    className="mt-1.5 w-full min-h-11 rounded-md border border-stone-300 bg-surface-primary px-3.5 py-2 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                                />
                                {fieldErrors.birthDate && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-red-800"
                                    >
                                        {fieldErrors.birthDate}
                                    </p>
                                )}
                            </div>

                            {profileError && (
                                <p
                                    role="alert"
                                    className="rounded-md border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
                                >
                                    {profileError}
                                </p>
                            )}

                            {profileMessage && (
                                <p
                                    role="status"
                                    className="rounded-md border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-900"
                                >
                                    {profileMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-light transition-colors hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSavingProfile
                                    ? "Guardando cambios..."
                                    : "Guardar cambios"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="rounded-xl border border-stone-300/70 bg-surface-card p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-heading text-2xl font-semibold text-text-primary">
                                    Mis reservas
                                </h2>
                                <p className="mt-1 text-sm text-text-muted">
                                    Historial y estado de tus mesas reservadas.
                                </p>
                            </div>
                            <Link
                                href="/booking"
                                className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-text-light transition-colors hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                            >
                                Nueva reserva
                            </Link>
                        </div>

                        {bookingsError && (
                            <div
                                role="alert"
                                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-800"
                            >
                                <span>{bookingsError}</span>
                                <button
                                    type="button"
                                    onClick={() => void loadBookings()}
                                    className="inline-flex min-h-11 items-center rounded-md border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {isLoadingBookings ? (
                            <div
                                role="status"
                                aria-live="polite"
                                className="mt-6 rounded-lg border border-stone-200 bg-surface-primary p-6 text-center text-sm text-text-muted"
                            >
                                Consultando tus reservas registradas...
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="mt-6 rounded-lg border border-stone-200 bg-surface-primary p-6 text-center">
                                <p className="text-sm text-text-secondary">
                                    Aún no tienes reservas registradas en tu
                                    cuenta.
                                </p>
                                <Link
                                    href="/booking"
                                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-brand-secondary px-5 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                                >
                                    Reservar una mesa
                                </Link>
                            </div>
                        ) : (
                            <ul className="mt-6 divide-y divide-stone-200">
                                {bookings.map((booking) => {
                                    const isConfirmed =
                                        booking.status === "confirmed";
                                    return (
                                        <li
                                            key={booking.id}
                                            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-heading text-lg font-semibold text-text-primary">
                                                    {formatEnvironmentLabel(
                                                        booking.environment,
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-sm text-text-secondary">
                                                    Fecha: {booking.date} a las{" "}
                                                    {booking.time} (
                                                    {booking.diners}{" "}
                                                    {booking.diners === 1
                                                        ? "persona"
                                                        : "personas"}
                                                    )
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-text-muted">
                                                    Estado:{" "}
                                                    {isConfirmed
                                                        ? "Confirmada"
                                                        : "Cancelada"}
                                                </p>
                                            </div>

                                            {isConfirmed && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        cancellingId ===
                                                        booking.id
                                                    }
                                                    onClick={() =>
                                                        void handleCancelBooking(
                                                            booking.id,
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 items-center justify-center self-start rounded-md border border-red-800/40 px-4 py-2 text-xs font-semibold text-red-900 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
                                                >
                                                    {cancellingId === booking.id
                                                        ? "Cancelando..."
                                                        : "Cancelar reserva"}
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

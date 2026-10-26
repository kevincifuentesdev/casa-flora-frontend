"use client";

import Image from "next/image";
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
type ActiveActionSection =
    | "edit-profile"
    | "addresses"
    | "payments"
    | "orders"
    | "settings"
    | null;

const PROFILE_FIELDS: readonly ProfileField[] = [
    "firstName",
    "lastName",
    "birthDate",
    "username",
];

const FAVORITE_COMBO_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCXSP_B-LGu-sMyt5QJu1AgpgAXmbzX3nkEDohVFQ0O-C9dXLOWTGSQGnrxJmnXhTrpsoEgizAb-uxK7YZWfZwcXYkMUzp7QTCu8JDbDYEbSNOYttMfvtU_Mk2zvg1wEDFYoZnwzMk61LqyM7gFOR3wpkkL-uk8_q_jelEOPAepyj_tYq6sz3g0kSnH9clcfuOXhXA9rsg8YA2xx2r0VNETWF09CKsY0IFzkraCyKIV-7Dk8JzxH7L_";

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

function formatEnvironmentLabel(
    environment: BookingRecord["environment"],
): string {
    return environment === "patio" ? "Patio interior" : "Salón principal";
}

export function ProfilePage() {
    const router = useRouter();
    const { session, isLoading: isSessionLoading, logout, refreshSession } =
        useSession();

    const [activeSection, setActiveSection] =
        useState<ActiveActionSection>(null);
    const [overrides, setOverrides] = useState<Partial<ProfileFormDraft>>({});
    const [fieldErrors, setFieldErrors] = useState<ProfileErrors>({});
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [repeatOrderFeedback, setRepeatOrderFeedback] = useState(false);

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

    const toggleSection = (section: Exclude<ActiveActionSection, null>) => {
        setActiveSection((prev) => (prev === section ? null : section));
        setProfileMessage(null);
        setProfileError(null);
    };

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
        setOverrides({});
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

    const handleRepeatOrder = () => {
        setRepeatOrderFeedback(true);
        setTimeout(() => {
            router.push("/menu");
        }, 700);
    };

    if (isSessionLoading) {
        return (
            <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-12 pb-24 md:px-(--spacing-margin-desktop)">
                <div
                    role="status"
                    aria-live="polite"
                    className="rounded-2xl border border-foreground-muted/15 bg-surface p-10 text-center text-foreground-muted shadow-(--shadow-ambient-sm)"
                >
                    Cargando tu perfil de comensal...
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="mx-auto w-full max-w-2xl px-(--spacing-margin-mobile) py-16 pb-24 md:px-(--spacing-margin-desktop)">
                <div className="rounded-2xl border border-foreground-muted/15 bg-surface p-8 text-center shadow-(--shadow-ambient-md)">
                    <h1 className="m-0 font-display text-3xl font-bold text-primary">
                        Tu cuenta en Casa Flora
                    </h1>
                    <p className="mt-3 text-base text-foreground-muted">
                        Inicia sesión para consultar tus recompensas, repetir
                        tus pedidos favoritos y gestionar tus reservas.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/login"
                            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition hover:opacity-90"
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            href="/menu"
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent px-6 py-2.5 text-sm font-semibold text-primary no-underline transition hover:bg-background-alt"
                        >
                            Explorar el menú
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const displayName = session.user.firstName?.trim() || "Comensal";
    const confirmedBookingsCount = bookings.filter(
        (b) => b.status === "confirmed",
    ).length;

    return (
        <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-8 pb-24 md:px-(--spacing-margin-desktop) md:py-10">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-foreground-muted/10 bg-surface p-8 text-center shadow-(--shadow-ambient-md) lg:col-span-4">
                    <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-[#e5b8ad] bg-[#fbf7f2] p-2 shadow-xs">
                        <Image
                            src="/img/temp_logo.png"
                            alt="Emblema de Casa Flora"
                            width={104}
                            height={104}
                            className="size-full rounded-full object-contain"
                        />
                    </div>

                    <h1 className="m-0 mt-5 font-display text-2xl font-bold text-primary">
                        ¡Hola, {displayName}!
                    </h1>
                    <p className="m-0 mt-1.5 text-xs text-foreground-muted sm:text-sm">
                        Sabor de hogar, siempre contigo.
                    </p>

                    <button
                        type="button"
                        onClick={() => toggleSection("edit-profile")}
                        aria-expanded={activeSection === "edit-profile"}
                        className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[#ad5d4e] bg-transparent px-6 py-2 text-xs font-semibold text-[#691a22] transition hover:bg-[#eed5ce]/35 dark:border-[#e5b8ad] dark:text-foreground"
                    >
                        {activeSection === "edit-profile"
                            ? "Cerrar Edición"
                            : "Editar Perfil"}
                    </button>
                </div>

                <div className="relative flex min-h-60 flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-[#691a22] to-[#4b030f] p-6 text-white shadow-(--shadow-ambient-md) sm:p-8 lg:col-span-8">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 200 200"
                        className="pointer-events-none absolute -top-6 -right-6 size-48 text-white/6"
                        fill="currentColor"
                    >
                        <path d="M112 18c8 28-14 48-8 76 4 18 22 28 24 48 3 26-18 46-44 46-32 0-54-26-48-58 4-22 22-38 38-54 18-18 32-34 38-58zm26 52c14 18 22 40 16 64-5 21-22 38-42 44 14-14 20-34 14-54-4-14-14-24-12-38 2-8 12-12 24-16z" />
                    </svg>

                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div>
                            <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-[#e8b98a] uppercase">
                                FIDELIZACIÓN
                            </p>
                            <h2 className="m-0 mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                                Tu Próxima Recompensa
                            </h2>
                            <p className="m-0 mt-1 text-sm text-white/80">
                                Empanadas de la Abuela (Faltan 3 pts)
                            </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f5c58b] px-3.5 py-1.5 text-xs font-bold text-[#3c2d28] shadow-xs">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="size-3.5 text-[#4b030f]"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            12 pts
                        </span>
                    </div>

                    <div className="relative z-10 mt-8">
                        <div
                            role="progressbar"
                            aria-label="Progreso de fidelización"
                            aria-valuenow={12}
                            aria-valuemin={0}
                            aria-valuemax={15}
                            className="h-2.5 w-full overflow-hidden rounded-full bg-[#31040b]"
                        >
                            <div className="h-full w-4/5 rounded-full bg-[#f5c58b]" />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#e8b98a]">
                            <span>0 pts</span>
                            <span>15 pts</span>
                        </div>
                    </div>
                </div>
            </div>

            <section aria-labelledby="profile-actions-heading" className="mt-10">
                <div className="mb-5 inline-block border-b-2 border-[#e5c5b5] pb-1.5">
                    <h2
                        id="profile-actions-heading"
                        className="m-0 font-display text-xl font-bold text-primary sm:text-2xl"
                    >
                        Mis Acciones
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                        type="button"
                        onClick={() => toggleSection("addresses")}
                        aria-expanded={activeSection === "addresses"}
                        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border bg-surface p-6 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) ${
                            activeSection === "addresses"
                                ? "border-accent ring-1 ring-accent"
                                : "border-foreground-muted/10"
                        }`}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#f6ded8] text-[#691a22]">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="size-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 21s-6-5.25-6-10a6 6 0 1112 0c0 4.75-6 10-6 10z"
                                />
                                <circle cx="12" cy="11" r="2.2" />
                            </svg>
                        </span>
                        <span className="mt-3 text-xs font-semibold text-foreground sm:text-sm">
                            Mis Direcciones
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleSection("payments")}
                        aria-expanded={activeSection === "payments"}
                        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border bg-surface p-6 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) ${
                            activeSection === "payments"
                                ? "border-accent ring-1 ring-accent"
                                : "border-foreground-muted/10"
                        }`}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#f6ded8] text-[#691a22]">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="size-5"
                            >
                                <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                />
                                <path d="M3 10h18M7 15h4" />
                            </svg>
                        </span>
                        <span className="mt-3 text-xs font-semibold text-foreground sm:text-sm">
                            Métodos de Pago
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleSection("orders")}
                        aria-expanded={activeSection === "orders"}
                        className={`relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border bg-surface p-6 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) ${
                            activeSection === "orders"
                                ? "border-accent ring-1 ring-accent"
                                : "border-foreground-muted/10"
                        }`}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#f6ded8] text-[#691a22]">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="size-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"
                                />
                                <path
                                    strokeLinecap="round"
                                    d="M9 8h6M9 12h6M9 16h4"
                                />
                            </svg>
                        </span>
                        <span className="mt-3 text-xs font-semibold text-foreground sm:text-sm">
                            Historial de Pedidos
                        </span>
                        {confirmedBookingsCount > 0 && (
                            <span className="mt-1 text-[11px] font-semibold text-accent">
                                {confirmedBookingsCount}{" "}
                                {confirmedBookingsCount === 1
                                    ? "reserva activa"
                                    : "reservas activas"}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleSection("settings")}
                        aria-expanded={activeSection === "settings"}
                        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border bg-surface p-6 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) ${
                            activeSection === "settings"
                                ? "border-accent ring-1 ring-accent"
                                : "border-foreground-muted/10"
                        }`}
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#f6ded8] text-[#691a22]">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="size-5"
                            >
                                <circle cx="12" cy="12" r="3" />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                                />
                            </svg>
                        </span>
                        <span className="mt-3 text-xs font-semibold text-foreground sm:text-sm">
                            Configuración
                        </span>
                    </button>
                </div>

                {(activeSection === "edit-profile" ||
                    activeSection === "settings") && (
                    <div className="mt-6 rounded-2xl border border-foreground-muted/15 bg-surface p-6 shadow-(--shadow-ambient-md) sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Datos personales y cuenta
                                </h3>
                                <p className="m-0 mt-1 text-xs text-foreground-muted sm:text-sm">
                                    Correo registrado: {session.user.email}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => void handleSignOut()}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-destructive/40 bg-transparent px-5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                                >
                                    Cerrar sesión
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(null)}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
                                >
                                    Cerrar panel
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={handleProfileSubmit}
                            noValidate
                            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <div>
                                <label
                                    htmlFor="profile-firstName"
                                    className="block text-xs font-semibold text-foreground"
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
                                    className="mt-1.5 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-background px-3.5 py-2 text-sm text-foreground"
                                />
                                {fieldErrors.firstName && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-destructive"
                                    >
                                        {fieldErrors.firstName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-lastName"
                                    className="block text-xs font-semibold text-foreground"
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
                                    className="mt-1.5 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-background px-3.5 py-2 text-sm text-foreground"
                                />
                                {fieldErrors.lastName && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-destructive"
                                    >
                                        {fieldErrors.lastName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-username"
                                    className="block text-xs font-semibold text-foreground"
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
                                    className="mt-1.5 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-background px-3.5 py-2 text-sm text-foreground"
                                />
                                {fieldErrors.username && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-destructive"
                                    >
                                        {fieldErrors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-birthDate"
                                    className="block text-xs font-semibold text-foreground"
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
                                    className="mt-1.5 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-background px-3.5 py-2 text-sm text-foreground"
                                />
                                {fieldErrors.birthDate && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-xs font-medium text-destructive"
                                    >
                                        {fieldErrors.birthDate}
                                    </p>
                                )}
                            </div>

                            {profileError && (
                                <p
                                    role="alert"
                                    className=" rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive sm:col-span-2"
                                >
                                    {profileError}
                                </p>
                            )}

                            {profileMessage && (
                                <p
                                    role="status"
                                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-800 sm:col-span-2 dark:text-emerald-300"
                                >
                                    {profileMessage}
                                </p>
                            )}

                            <div className="flex justify-end sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSavingProfile
                                        ? "Guardando cambios..."
                                        : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeSection === "orders" && (
                    <div className="mt-6 rounded-2xl border border-foreground-muted/15 bg-surface p-6 shadow-(--shadow-ambient-md) sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Historial de Pedidos y Reservas
                                </h3>
                                <p className="m-0 mt-1 text-xs text-foreground-muted sm:text-sm">
                                    Consulta y administra tus reservas de mesa
                                    en Casa Flora.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href="/booking"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90"
                                >
                                    Nueva reserva
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(null)}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
                                >
                                    Cerrar panel
                                </button>
                            </div>
                        </div>

                        {bookingsError && (
                            <div
                                role="alert"
                                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive"
                            >
                                <span>{bookingsError}</span>
                                <button
                                    type="button"
                                    onClick={() => void loadBookings()}
                                    className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-destructive/40 bg-transparent px-4 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {isLoadingBookings ? (
                            <div
                                role="status"
                                aria-live="polite"
                                className="mt-6 rounded-xl border border-foreground-muted/15 bg-background p-6 text-center text-sm text-foreground-muted"
                            >
                                Consultando tus reservas registradas...
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="mt-6 rounded-xl border border-foreground-muted/15 bg-background p-6 text-center">
                                <p className="m-0 text-sm text-foreground-muted">
                                    Aún no tienes reservas registradas en tu
                                    cuenta.
                                </p>
                                <Link
                                    href="/booking"
                                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-accent px-5 py-2 text-xs font-semibold text-primary no-underline transition hover:bg-background-alt"
                                >
                                    Reservar una mesa
                                </Link>
                            </div>
                        ) : (
                            <ul className="m-0 mt-6 list-none divide-y divide-foreground-muted/15 p-0">
                                {bookings.map((booking) => {
                                    const isConfirmed =
                                        booking.status === "confirmed";
                                    return (
                                        <li
                                            key={booking.id}
                                            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="m-0 font-display text-lg font-bold text-primary">
                                                    {formatEnvironmentLabel(
                                                        booking.environment,
                                                    )}
                                                </p>
                                                <p className="m-0 mt-0.5 text-sm text-foreground">
                                                    Fecha: {booking.date} a las{" "}
                                                    {booking.time} (
                                                    {booking.diners}{" "}
                                                    {booking.diners === 1
                                                        ? "persona"
                                                        : "personas"}
                                                    )
                                                </p>
                                                <p className="m-0 mt-1 text-xs font-semibold text-foreground-muted">
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
                                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center self-start rounded-full border border-destructive/40 bg-transparent px-5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
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
                )}

                {activeSection === "addresses" && (
                    <div className="mt-6 rounded-2xl border border-foreground-muted/15 bg-surface p-6 shadow-(--shadow-ambient-md) sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Mis Direcciones
                                </h3>
                                <p className="m-0 mt-1 text-sm text-foreground-muted">
                                    Recogida principal configurada en sede Casa
                                    Flora Medellín (El Poblado) y entrega a
                                    domicilio en el Valle de Aburrá.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveSection(null)}
                                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
                            >
                                Cerrar panel
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === "payments" && (
                    <div className="mt-6 rounded-2xl border border-foreground-muted/15 bg-surface p-6 shadow-(--shadow-ambient-md) sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Métodos de Pago
                                </h3>
                                <p className="m-0 mt-1 text-sm text-foreground-muted">
                                    Aceptamos pago contra entrega, transferencia
                                    PSE y tarjetas débito o crédito directamente
                                    en el restaurante.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveSection(null)}
                                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
                            >
                                Cerrar panel
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section aria-labelledby="profile-favorites-heading" className="mt-10">
                <div className="mb-5 inline-block border-b-2 border-[#e5c5b5] pb-1.5">
                    <h2
                        id="profile-favorites-heading"
                        className="m-0 font-display text-xl font-bold text-primary sm:text-2xl"
                    >
                        Tus favoritos de siempre
                    </h2>
                </div>

                <article className="grid grid-cols-1 overflow-hidden rounded-2xl border border-foreground-muted/10 bg-surface shadow-(--shadow-ambient-md) md:grid-cols-12">
                    <div className="relative min-h-60 md:col-span-5">
                        <Image
                            src={FAVORITE_COMBO_IMAGE}
                            alt="Combo Familiar Tradición con empanadas, ají y guacamole"
                            fill
                            sizes="(max-width: 768px) 100vw, 42vw"
                            className="object-cover"
                        />
                        <span className="absolute top-4 left-4 rounded-full bg-[#e8cfc8]/90 px-3.5 py-1 text-[10px] font-bold tracking-wider text-[#554242] uppercase backdrop-blur-xs">
                            RECOGIDA EN LOCAL
                        </span>
                    </div>

                    <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-7">
                        <div>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <h3 className="m-0 font-display text-2xl font-bold text-primary sm:text-[1.75rem]">
                                    Combo Familiar Tradición
                                </h3>
                                <span className="font-display text-lg font-semibold text-secondary">
                                    $45.000
                                </span>
                            </div>

                            <p className="m-0 mt-3 text-sm/6 text-foreground-muted">
                                12 empanadas de carne desmechada crujientes,
                                acompañadas de 2 salsas de la casa y 1 porción
                                generosa de guacamole artesanal. El sabor
                                perfecto para compartir en familia.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                            {repeatOrderFeedback && (
                                <span
                                    role="status"
                                    className="text-xs font-semibold text-primary"
                                >
                                    Redirigiendo al menú...
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleRepeatOrder}
                                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#a87c4f] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#936a41]"
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="size-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 4v5h5M20 12a8 8 0 11-2.34-5.66L4 9"
                                    />
                                </svg>
                                Repetir Pedido
                            </button>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
}

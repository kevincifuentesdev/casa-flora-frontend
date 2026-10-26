"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { validateSignUpField } from "@/features/auth/domain/authValidation";
import type {
    DietPreference,
    FavoriteMoment,
    PaymentMethodType,
    SignUpDraft,
    SpiceTolerance,
} from "@/features/auth/domain/session";
import { useSession } from "@/features/auth/hooks/useSession";
import {
    addUserAddress,
    addUserPaymentMethod,
    createCustomerOrder,
    removeUserAddress,
    removeUserPaymentMethod,
    updateUserProfile,
} from "@/features/auth/services/authService";
import type { BookingRecord } from "@/features/booking/domain/types";
import {
    cancelMyBooking,
    fetchMyBookings,
} from "@/features/booking/services/bookingService";
import { ApiClientError } from "@/features/common/services/apiClient";
import { formatPrice } from "@/features/products/domain/product";

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

function formatRelativeOrderDate(isoDate: string): string {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return "Pedido reciente";
    const diffMs = Date.now() - parsed.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    if (diffDays === 0) return "Último pedido realizado hoy";
    if (diffDays === 1) return "Último pedido realizado ayer";
    return `Último pedido realizado hace ${diffDays} días`;
}

export function ProfilePage() {
    const router = useRouter();
    const { session, isLoading: isSessionLoading, logout, refreshSession } =
        useSession();

    const [activeSection, setActiveSection] =
        useState<ActiveActionSection>(null);
    const [overrides, setOverrides] = useState<Partial<ProfileFormDraft>>({});
    const [dietOverride, setDietOverride] = useState<
        DietPreference | null | undefined
    >(undefined);
    const [spiceOverride, setSpiceOverride] = useState<
        SpiceTolerance | null | undefined
    >(undefined);
    const [momentOverride, setMomentOverride] = useState<
        FavoriteMoment | null | undefined
    >(undefined);

    const [fieldErrors, setFieldErrors] = useState<ProfileErrors>({});
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [newAddressLabel, setNewAddressLabel] = useState("Casa");
    const [newAddressLine, setNewAddressLine] = useState("");
    const [newNeighborhood, setNewNeighborhood] = useState("");
    const [newAddressDetails, setNewAddressDetails] = useState("");
    const [addressError, setAddressError] = useState<string | null>(null);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    const [newPaymentType, setNewPaymentType] =
        useState<PaymentMethodType>("card");
    const [newPaymentBrand, setNewPaymentBrand] = useState("Visa");
    const [newPaymentLastFour, setNewPaymentLastFour] = useState("");
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderBanner, setOrderBanner] = useState<string | null>(null);

    const draft: ProfileFormDraft = {
        firstName: overrides.firstName ?? session?.user?.firstName ?? "",
        lastName: overrides.lastName ?? session?.user?.lastName ?? "",
        birthDate: overrides.birthDate ?? session?.user?.birthDate ?? "",
        username: overrides.username ?? session?.user?.username ?? "",
    };

    const selectedDiet =
        dietOverride !== undefined
            ? dietOverride
            : (session?.user?.preferences?.dietPreference ?? null);
    const selectedSpice =
        spiceOverride !== undefined
            ? spiceOverride
            : (session?.user?.preferences?.spiceTolerance ?? null);
    const selectedMoment =
        momentOverride !== undefined
            ? momentOverride
            : (session?.user?.preferences?.favoriteMoment ?? null);

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
        setAddressError(null);
        setPaymentError(null);
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
            dietPreference: selectedDiet,
            spiceTolerance: selectedSpice,
            favoriteMoment: selectedMoment,
        });
        setIsSavingProfile(false);

        if (result.error) {
            setProfileError(result.error);
            return;
        }

        await refreshSession();
        setOverrides({});
        setDietOverride(undefined);
        setSpiceOverride(undefined);
        setMomentOverride(undefined);
        setProfileMessage(
            "Tus datos y preferencias culinarias han sido actualizados.",
        );
    };

    const handleAddAddress = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAddressError(null);

        if (
            newAddressLine.trim().length < 5 ||
            newNeighborhood.trim().length < 2
        ) {
            setAddressError("Ingresa una dirección válida y el barrio.");
            return;
        }

        setIsSavingAddress(true);
        const res = await addUserAddress({
            label: newAddressLabel.trim() || "Casa",
            addressLine: newAddressLine.trim(),
            neighborhood: newNeighborhood.trim(),
            city: "Medellín, Antioquia",
            details: newAddressDetails.trim() || null,
            isDefault: true,
        });
        setIsSavingAddress(false);

        if (res.error) {
            setAddressError(res.error);
            return;
        }

        setNewAddressLine("");
        setNewNeighborhood("");
        setNewAddressDetails("");
    };

    const handleRemoveAddress = async (addressId: string) => {
        setAddressError(null);
        const res = await removeUserAddress(addressId);
        if (!res.ok && res.error) {
            setAddressError(res.error);
        }
    };

    const handleAddPayment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPaymentError(null);

        if (
            newPaymentType === "card" &&
            !/^\d{4}$/.test(newPaymentLastFour.trim())
        ) {
            setPaymentError("Ingresa los últimos 4 dígitos de tu tarjeta.");
            return;
        }

        setIsSavingPayment(true);
        const brand =
            newPaymentType === "cash"
                ? "Efectivo contra entrega"
                : newPaymentBrand.trim();
        const res = await addUserPaymentMethod({
            type: newPaymentType,
            brand,
            lastFour:
                newPaymentType === "card" ? newPaymentLastFour.trim() : null,
            holderName: session?.user?.name || null,
            isDefault: true,
        });
        setIsSavingPayment(false);

        if (res.error) {
            setPaymentError(res.error);
            return;
        }

        setNewPaymentLastFour("");
    };

    const handleRemovePayment = async (paymentMethodId: string) => {
        setPaymentError(null);
        const res = await removeUserPaymentMethod(paymentMethodId);
        if (!res.ok && res.error) {
            setPaymentError(res.error);
        }
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

    const handleBuyFeaturedProduct = async (productId: string) => {
        if (isPlacingOrder) return;
        setIsPlacingOrder(true);
        setOrderBanner(null);

        const result = await createCustomerOrder({
            items: [{ productId, quantity: 1 }],
        });
        setIsPlacingOrder(false);

        if (result.error) {
            setOrderBanner(result.error);
            return;
        }

        if (result.order) {
            setOrderBanner(
                `¡Pedido #${result.order.orderNumber} confirmado! Sumaste +${result.order.pointsEarned} puntos en tu cuenta.`,
            );
        }
    };

    if (isSessionLoading) {
        return (
            <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-10 pb-28 md:px-(--spacing-margin-desktop)">
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
            <div className="mx-auto w-full max-w-2xl px-(--spacing-margin-mobile) py-14 pb-28 md:px-(--spacing-margin-desktop)">
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

    const { user } = session;
    const displayName = user.firstName?.trim() || "Comensal";
    const loyalty = user.loyalty;
    const addresses = user.addresses ?? [];
    const paymentMethods = user.paymentMethods ?? [];
    const orders = user.orders ?? [];
    const defaultAddress =
        addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
    const defaultPayment =
        paymentMethods.find((p) => p.isDefault) ?? paymentMethods[0] ?? null;
    const latestOrder = orders[0] ?? null;
    const latestOrderItem = latestOrder?.items[0] ?? null;
    const recommendedProduct = user.recommendedProduct;

    const featuredDish = latestOrderItem
        ? {
              productId: latestOrderItem.productId,
              name: latestOrderItem.productName,
              description: latestOrderItem.productDescription,
              imageUrl: latestOrderItem.productImageUrl,
              price: latestOrder.totalAmount,
              orderNumber: latestOrder.orderNumber,
              statusLabel:
                  latestOrder.status === "delivered"
                      ? "Entregado"
                      : "En preparación",
              subtitle: formatRelativeOrderDate(latestOrder.createdAt),
              addressLabel: latestOrder.addressLabel,
              badgeLabel: "ÚLTIMO PEDIDO",
              ctaLabel: "Repetir Pedido",
          }
        : recommendedProduct
          ? {
                productId: recommendedProduct.id,
                name: recommendedProduct.name,
                description: recommendedProduct.description,
                imageUrl: recommendedProduct.imageUrl,
                price: recommendedProduct.price,
                orderNumber: null,
                statusLabel: "Recomendado para ti",
                subtitle:
                    user.preferences.dietPreference === "trees"
                        ? "Seleccionado según tu preferencia vegetal"
                        : user.preferences.dietPreference === "cows"
                          ? "Seleccionado según tu gusto por la sazón tradicional"
                          : "Sugerencia especial del chef de Casa Flora",
                addressLabel: defaultAddress
                    ? `Dirección ${defaultAddress.label} • ${defaultAddress.neighborhood}`
                    : "Recogida en local • El Poblado",
                badgeLabel: "RECOMENDADO PARA TI",
                ctaLabel: "Pedir Ahora",
            }
          : null;

    const confirmedBookingsCount = bookings.filter(
        (b) => b.status === "confirmed",
    ).length;

    const addressesSubtitle =
        addresses.length === 0
            ? "Sin guardar"
            : addresses.length === 1
              ? "1 guardada"
              : `${addresses.length} guardadas`;

    const paymentSubtitle = defaultPayment
        ? defaultPayment.lastFour
            ? `${defaultPayment.brand} **** ${defaultPayment.lastFour}`
            : defaultPayment.brand
        : "Sin configurar";

    const ordersSubtitle =
        orders.length > 0
            ? `${orders.length} ${orders.length === 1 ? "orden" : "órdenes"}`
            : confirmedBookingsCount > 0
              ? `${confirmedBookingsCount} ${confirmedBookingsCount === 1 ? "reserva" : "reservas"}`
              : "Sin pedidos";

    return (
        <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-5 pb-28 md:px-(--spacing-margin-desktop) md:py-10 md:pb-16">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
                <div className="flex items-center justify-between gap-3 lg:col-span-4 lg:flex-col lg:justify-center lg:rounded-2xl lg:border lg:border-foreground-muted/10 lg:bg-surface lg:p-8 lg:text-center lg:shadow-(--shadow-ambient-md)">
                    <div className="flex min-w-0 items-center gap-3.5 lg:flex-col lg:gap-0">
                        <div className="relative flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-[#bc8e56] bg-[#fbf7f2] p-1.5 shadow-xs lg:size-28 lg:border-[#e5b8ad] lg:p-2">
                            <Image
                                src="/img/temp_logo.png"
                                alt="Emblema de Casa Flora"
                                width={104}
                                height={104}
                                className="size-full rounded-full object-contain"
                            />
                            <span
                                aria-hidden="true"
                                className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-background bg-emerald-600 lg:hidden"
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="m-0 text-[10px] font-bold tracking-[0.12em] text-[#ad5d4e] uppercase lg:hidden">
                                BIENVENIDO A CASA
                            </p>
                            <h1 className="m-0 truncate font-display text-2xl leading-tight font-bold text-primary lg:mt-5">
                                ¡Hola, {displayName}!
                            </h1>
                            <p className="m-0 mt-0.5 truncate text-xs text-foreground-muted lg:hidden">
                                {defaultAddress
                                    ? `${defaultAddress.neighborhood}, ${defaultAddress.city}`
                                    : "Medellín, Antioquia"}
                            </p>
                            <p className="m-0 mt-1.5 hidden text-sm text-foreground-muted lg:block">
                                Sabor de hogar, siempre contigo.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleSection("edit-profile")}
                        aria-expanded={activeSection === "edit-profile"}
                        className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/25 bg-surface px-4 py-2 text-xs font-semibold text-primary shadow-2xs transition hover:bg-[#eed5ce]/35 lg:mt-6 lg:border-[#ad5d4e] lg:bg-transparent lg:px-6 lg:text-[#691a22] dark:border-[#e5b8ad] dark:text-foreground"
                    >
                        <span className="lg:hidden">
                            {activeSection === "edit-profile"
                                ? "Cerrar"
                                : "Editar"}
                        </span>
                        <span className="hidden lg:inline">
                            {activeSection === "edit-profile"
                                ? "Cerrar Edición"
                                : "Editar Perfil"}
                        </span>
                    </button>
                </div>

                <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-[#4b151b] via-[#3d1015] to-[#2c0b0e] p-5 text-white shadow-(--shadow-ambient-md) sm:p-7 lg:col-span-8 lg:min-h-60 lg:from-[#691a22] lg:to-[#4b030f]">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 120 120"
                        className="pointer-events-none absolute -right-4 -bottom-4 size-36 text-white/7 lg:-top-6 lg:-right-6 lg:bottom-auto lg:size-48"
                        fill="currentColor"
                    >
                        <path d="M60 18c7 0 13 6 13 13 0 4-2 8-5 10 3-1 6-2 9-2 7 0 13 6 13 13s-6 13-13 13c-3 0-6-1-9-2 3 2 5 6 5 10 0 7-6 13-13 13s-13-6-13-13c0-4 2-8 5-10-3 1-6 2-9 2-7 0-13-6-13-13s6-13 13-13c3 0 6 1 9 2-3-2-5-6-5-10 0-7 6-13 13-13zm0 26a8 8 0 100 16 8 8 0 000-16zm-4 42h8v24h-8V86z" />
                    </svg>

                    <div className="relative z-10 flex items-start justify-between gap-3">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold text-[#f5c58b] lg:hidden">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="size-3.5"
                                >
                                    <path d="M10 3a1.5 1.5 0 011.415 1.003A7.002 7.002 0 0117 11H3a7.002 7.002 0 015.585-6.997A1.5 1.5 0 0110 3zm-8 9.5h16a1 1 0 010 2H2a1 1 0 010-2z" />
                                </svg>
                                Club Casa Flora
                            </span>
                            <p className="m-0 hidden text-[11px] font-bold tracking-[0.14em] text-[#e8b98a] uppercase lg:block">
                                FIDELIZACIÓN
                            </p>

                            <h2 className="m-0 mt-3 font-display text-xl font-bold text-white sm:text-2xl lg:mt-2 lg:text-3xl">
                                <span className="lg:hidden">
                                    {loyalty.rewardName}
                                </span>
                                <span className="hidden lg:inline">
                                    Tu Próxima Recompensa
                                </span>
                            </h2>

                            <p className="m-0 mt-1 text-xs text-white/75 lg:hidden">
                                Tus puntos acumulados de tradición y amor
                            </p>
                            <p className="m-0 mt-1 hidden text-sm text-white/80 lg:block">
                                {loyalty.rewardName} (Faltan{" "}
                                {loyalty.pointsRemaining} pts)
                            </p>
                        </div>

                        <div className="shrink-0 text-right lg:hidden">
                            <span className="block font-display text-2xl leading-none font-bold text-[#f5c58b]">
                                {loyalty.points}
                            </span>
                            <span className="mt-1 block text-[9px] font-bold tracking-[0.14em] text-white/70 uppercase">
                                PUNTOS
                            </span>
                        </div>

                        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#f5c58b] px-3.5 py-1.5 text-xs font-bold text-[#3c2d28] shadow-xs lg:inline-flex">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="size-3.5 text-[#4b030f]"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {loyalty.points} pts
                        </span>
                    </div>

                    <div className="relative z-10 mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5 text-xs lg:hidden">
                        <div className="flex items-center gap-2 text-white/85">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="size-4 shrink-0 text-[#f5c58b]"
                            >
                                <rect
                                    x="3"
                                    y="8"
                                    width="18"
                                    height="13"
                                    rx="2"
                                />
                                <path d="M12 8v13M3 12h18M12 8c-2.5 0-4-1.5-4-3s1.5-2 4 0c2.5-2 4-.5 4 0s-1.5 3-4 3z" />
                            </svg>
                            <span>
                                Te faltan{" "}
                                <strong className="font-bold text-white">
                                    {loyalty.pointsRemaining} pts
                                </strong>{" "}
                                para tu próxima recompensa
                            </span>
                        </div>
                        <Link
                            href="/menu"
                            className="inline-flex min-h-11 shrink-0 items-center font-bold text-[#f5c58b] underline underline-offset-4 hover:text-white"
                        >
                            Canjear
                        </Link>
                    </div>

                    <div className="relative z-10 mt-8 hidden lg:block">
                        <div
                            role="progressbar"
                            aria-label="Progreso de fidelización"
                            aria-valuenow={loyalty.pointsInCurrentCycle}
                            aria-valuemin={0}
                            aria-valuemax={loyalty.nextRewardGoal}
                            className="h-2.5 w-full overflow-hidden rounded-full bg-[#31040b]"
                        >
                            <div
                                className="h-full rounded-full bg-[#f5c58b] transition-all duration-500"
                                style={{
                                    width: `${Math.max(6, loyalty.progressPercent)}%`,
                                }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#e8b98a]">
                            <span>0 pts</span>
                            <span>{loyalty.nextRewardGoal} pts</span>
                        </div>
                    </div>
                </div>
            </div>

            <section
                aria-labelledby="profile-actions-heading"
                className="mt-7 sm:mt-10"
            >
                <div className="mb-3.5 sm:mb-5 sm:inline-block sm:border-b-2 sm:border-[#e5c5b5] sm:pb-1.5">
                    <h2
                        id="profile-actions-heading"
                        className="m-0 font-display text-xl font-bold text-primary sm:text-2xl"
                    >
                        <span className="sm:hidden">Mi Cuenta</span>
                        <span className="hidden sm:inline">Mis Acciones</span>
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => toggleSection("addresses")}
                        aria-expanded={activeSection === "addresses"}
                        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border bg-surface px-2.5 py-4 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) sm:min-h-32 sm:rounded-xl sm:p-6 ${
                            activeSection === "addresses"
                                ? "border-accent ring-1 ring-accent"
                                : "border-foreground-muted/10"
                        }`}
                    >
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#fbf2e3] text-[#4b151b] sm:size-12 sm:bg-[#f6ded8] sm:text-[#691a22]">
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
                        <span className="mt-2.5 text-xs leading-tight font-bold text-foreground sm:mt-3 sm:text-sm sm:font-semibold">
                            Mis Direcciones
                        </span>
                        <span className="mt-1 text-[10px] text-foreground-muted">
                            {addressesSubtitle}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleSection("payments")}
                        aria-expanded={activeSection === "payments"}
                        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border bg-surface px-2.5 py-4 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) sm:min-h-32 sm:rounded-xl sm:p-6 ${
                            activeSection === "payments"
                                ? "border-accent ring-1 ring-accent"
                                : "border-foreground-muted/10"
                        }`}
                    >
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#fbf2e3] text-[#4b151b] sm:size-12 sm:bg-[#f6ded8] sm:text-[#691a22]">
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
                        <span className="mt-2.5 text-xs leading-tight font-bold text-foreground sm:mt-3 sm:text-sm sm:font-semibold">
                            Métodos de Pago
                        </span>
                        <span className="mt-1 max-w-full truncate text-[10px] text-foreground-muted">
                            {paymentSubtitle}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleSection("orders")}
                        aria-expanded={activeSection === "orders"}
                        className={`relative flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border bg-surface px-2.5 py-4 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) sm:min-h-32 sm:rounded-xl sm:p-6 ${
                            activeSection === "orders"
                                ? "border-accent ring-1 ring-accent"
                                : "border-foreground-muted/10"
                        }`}
                    >
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#fbf2e3] text-[#4b151b] sm:size-12 sm:bg-[#f6ded8] sm:text-[#691a22]">
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
                        <span className="mt-2.5 text-xs leading-tight font-bold text-foreground sm:mt-3 sm:text-sm sm:font-semibold">
                            <span className="sm:hidden">Historial Pedidos</span>
                            <span className="hidden sm:inline">
                                Historial de Pedidos
                            </span>
                        </span>
                        <span className="mt-1 text-[10px] text-foreground-muted sm:text-[11px] sm:font-semibold sm:text-accent">
                            {ordersSubtitle}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleSection("settings")}
                        aria-expanded={activeSection === "settings"}
                        className={`hidden min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border bg-surface p-6 text-center shadow-(--shadow-ambient-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-ambient-md) sm:flex ${
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
                        <span className="mt-1 text-[10px] text-foreground-muted">
                            Perfil y gustos
                        </span>
                    </button>
                </div>

                {(activeSection === "edit-profile" ||
                    activeSection === "settings") && (
                    <div className="mt-5 rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-md) sm:mt-6 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Datos personales y preferencias de dieta
                                </h3>
                                <p className="m-0 mt-1 text-xs text-foreground-muted sm:text-sm">
                                    Correo registrado: {user.email}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Link
                                    href="/onboarding"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent px-4 py-2 text-xs font-semibold text-primary no-underline transition hover:bg-background-alt"
                                >
                                    Asistente de bienvenida
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => void handleSignOut()}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-destructive/40 bg-transparent px-4 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
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
                            className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
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

                            <div className="border-t border-foreground-muted/15 pt-4 sm:col-span-2">
                                <h4 className="m-0 font-display text-lg font-bold text-primary">
                                    Cuestionario de gustos: ¿Te gustan más las
                                    vacas o los árboles?
                                </h4>
                                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                    {(
                                        [
                                            {
                                                id: "cows",
                                                title: "Las vacas",
                                                desc: "Sazón tradicional y carnes.",
                                            },
                                            {
                                                id: "trees",
                                                title: "Los árboles",
                                                desc: "Opciones veganas y vegetales.",
                                            },
                                            {
                                                id: "both",
                                                title: "Ambos mundos",
                                                desc: "Equilibrio de toda la carta.",
                                            },
                                        ] as const
                                    ).map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() =>
                                                setDietOverride(opt.id)
                                            }
                                            className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-xl border p-3 text-left transition ${
                                                selectedDiet === opt.id
                                                    ? "border-primary bg-primary/6 ring-1 ring-primary"
                                                    : "border-foreground-muted/20 bg-background hover:border-primary/40"
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-primary">
                                                {opt.title}
                                            </span>
                                            <span className="mt-0.5 text-[11px] text-foreground-muted">
                                                {opt.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-spice"
                                    className="block text-xs font-semibold text-foreground"
                                >
                                    Nivel de picante preferido
                                </label>
                                <select
                                    id="profile-spice"
                                    value={selectedSpice ?? ""}
                                    onChange={(e) =>
                                        setSpiceOverride(
                                            (e.target.value ||
                                                null) as SpiceTolerance | null,
                                        )
                                    }
                                    className="mt-1.5 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-background px-3.5 py-2 text-sm text-foreground"
                                >
                                    <option value="">Sin preferencia</option>
                                    <option value="none">
                                        De lejitos (Cero picante)
                                    </option>
                                    <option value="mild">
                                        Un guiño suave (Ají dulce)
                                    </option>
                                    <option value="spicy">
                                        Sin miedo (Ají picante de la casa)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="profile-moment"
                                    className="block text-xs font-semibold text-foreground"
                                >
                                    Momento favorito en la mesa
                                </label>
                                <select
                                    id="profile-moment"
                                    value={selectedMoment ?? ""}
                                    onChange={(e) =>
                                        setMomentOverride(
                                            (e.target.value ||
                                                null) as FavoriteMoment | null,
                                        )
                                    }
                                    className="mt-1.5 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-background px-3.5 py-2 text-sm text-foreground"
                                >
                                    <option value="">Sin preferencia</option>
                                    <option value="almuerzo">
                                        Almuerzo casero (Plato fuerte)
                                    </option>
                                    <option value="tarde">
                                        Media tarde (Entradas y empanadas)
                                    </option>
                                    <option value="postre">
                                        Toque dulce (Postres artesanales)
                                    </option>
                                </select>
                            </div>

                            {profileError && (
                                <p
                                    role="alert"
                                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive sm:col-span-2"
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
                                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {isSavingProfile
                                        ? "Guardando cambios..."
                                        : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeSection === "addresses" && (
                    <div className="mt-5 rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-md) sm:mt-6 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Mis Direcciones Guardadas
                                </h3>
                                <p className="m-0 mt-1 text-xs text-foreground-muted sm:text-sm">
                                    Agrega o administra tus direcciones de
                                    entrega en el Valle de Aburrá.
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

                        {addressError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive"
                            >
                                {addressError}
                            </p>
                        )}

                        {addresses.length === 0 ? (
                            <p className="mt-4 rounded-xl border border-foreground-muted/15 bg-background p-4 text-xs text-foreground-muted">
                                Aún no has guardado direcciones de entrega.
                                Agrega una a continuación.
                            </p>
                        ) : (
                            <ul className="m-0 mt-4 list-none divide-y divide-foreground-muted/15 p-0">
                                {addresses.map((addr) => (
                                    <li
                                        key={addr.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                                    >
                                        <div>
                                            <p className="m-0 font-display text-base font-bold text-primary">
                                                {addr.label}{" "}
                                                {addr.isDefault && (
                                                    <span className="ml-1.5 text-xs font-normal text-accent">
                                                        (Principal)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="m-0 mt-0.5 text-xs text-foreground">
                                                {addr.addressLine} •{" "}
                                                {addr.neighborhood}, {addr.city}
                                            </p>
                                            {addr.details && (
                                                <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                                    {addr.details}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleRemoveAddress(
                                                    addr.id,
                                                )
                                            }
                                            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-destructive/35 bg-transparent px-4 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <form
                            onSubmit={handleAddAddress}
                            className="mt-5 grid grid-cols-1 gap-3 border-t border-foreground-muted/15 pt-5 sm:grid-cols-4"
                        >
                            <input
                                type="text"
                                placeholder="Etiqueta (Casa, Oficina)"
                                value={newAddressLabel}
                                onChange={(e) =>
                                    setNewAddressLabel(e.target.value)
                                }
                                className="min-h-11 rounded-lg border border-foreground-muted/30 bg-background px-3 py-2 text-xs text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Dirección (Calle 10 # 43A-30)"
                                value={newAddressLine}
                                onChange={(e) =>
                                    setNewAddressLine(e.target.value)
                                }
                                className="min-h-11 rounded-lg border border-foreground-muted/30 bg-background px-3 py-2 text-xs text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Barrio (El Poblado)"
                                value={newNeighborhood}
                                onChange={(e) =>
                                    setNewNeighborhood(e.target.value)
                                }
                                className="min-h-11 rounded-lg border border-foreground-muted/30 bg-background px-3 py-2 text-xs text-foreground"
                            />
                            <button
                                type="submit"
                                disabled={isSavingAddress}
                                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                            >
                                {isSavingAddress
                                    ? "Guardando..."
                                    : "Agregar dirección"}
                            </button>
                        </form>
                    </div>
                )}

                {activeSection === "payments" && (
                    <div className="mt-5 rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-md) sm:mt-6 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Métodos de Pago
                                </h3>
                                <p className="m-0 mt-1 text-xs text-foreground-muted sm:text-sm">
                                    Administra tus medios de pago para ordenar y
                                    sumar puntos rápidamente.
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

                        {paymentError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive"
                            >
                                {paymentError}
                            </p>
                        )}

                        {paymentMethods.length === 0 ? (
                            <p className="mt-4 rounded-xl border border-foreground-muted/15 bg-background p-4 text-xs text-foreground-muted">
                                Aún no has registrado métodos de pago. Agrega
                                uno a continuación.
                            </p>
                        ) : (
                            <ul className="m-0 mt-4 list-none divide-y divide-foreground-muted/15 p-0">
                                {paymentMethods.map((pm) => (
                                    <li
                                        key={pm.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                                    >
                                        <div>
                                            <p className="m-0 font-display text-base font-bold text-primary">
                                                {pm.brand}{" "}
                                                {pm.lastFour
                                                    ? `**** ${pm.lastFour}`
                                                    : ""}
                                                {pm.isDefault && (
                                                    <span className="ml-1.5 text-xs font-normal text-accent">
                                                        (Principal)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                                Tipo:{" "}
                                                {pm.type === "card"
                                                    ? "Tarjeta"
                                                    : pm.type === "pse"
                                                      ? "PSE / Transferencia"
                                                      : "Contra entrega"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleRemovePayment(pm.id)
                                            }
                                            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-destructive/35 bg-transparent px-4 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <form
                            onSubmit={handleAddPayment}
                            className="mt-5 grid grid-cols-1 gap-3 border-t border-foreground-muted/15 pt-5 sm:grid-cols-4"
                        >
                            <select
                                value={newPaymentType}
                                onChange={(e) =>
                                    setNewPaymentType(
                                        e.target.value as PaymentMethodType,
                                    )
                                }
                                className="min-h-11 rounded-lg border border-foreground-muted/30 bg-background px-3 py-2 text-xs text-foreground"
                            >
                                <option value="card">Tarjeta</option>
                                <option value="pse">PSE / Nequi</option>
                                <option value="cash">Contra entrega</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Franquicia o Banco (Visa, PSE)"
                                value={newPaymentBrand}
                                onChange={(e) =>
                                    setNewPaymentBrand(e.target.value)
                                }
                                disabled={newPaymentType === "cash"}
                                className="min-h-11 rounded-lg border border-foreground-muted/30 bg-background px-3 py-2 text-xs text-foreground disabled:opacity-50"
                            />

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="Últimos 4 dígitos (4912)"
                                value={newPaymentLastFour}
                                onChange={(e) =>
                                    setNewPaymentLastFour(
                                        e.target.value.replace(/\D/g, ""),
                                    )
                                }
                                disabled={newPaymentType !== "card"}
                                className="min-h-11 rounded-lg border border-foreground-muted/30 bg-background px-3 py-2 text-xs text-foreground disabled:opacity-50"
                            />

                            <button
                                type="submit"
                                disabled={isSavingPayment}
                                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                            >
                                {isSavingPayment
                                    ? "Guardando..."
                                    : "Agregar medio"}
                            </button>
                        </form>
                    </div>
                )}

                {activeSection === "orders" && (
                    <div className="mt-5 rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-md) sm:mt-6 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <h3 className="m-0 font-display text-xl font-bold text-primary">
                                    Historial de Pedidos y Reservas
                                </h3>
                                <p className="m-0 mt-1 text-xs text-foreground-muted sm:text-sm">
                                    Tus compras que suman puntos y tus reservas
                                    de mesa en Casa Flora.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Link
                                    href="/menu"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90"
                                >
                                    Pedir en el menú
                                </Link>
                                <Link
                                    href="/booking"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent px-5 py-2 text-xs font-semibold text-primary no-underline transition hover:bg-background-alt"
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

                        <div className="mt-5">
                            <h4 className="m-0 font-display text-base font-bold text-primary">
                                Pedidos realizados ({orders.length})
                            </h4>
                            {orders.length === 0 ? (
                                <p className="mt-2 rounded-xl border border-foreground-muted/15 bg-background p-4 text-xs text-foreground-muted">
                                    Aún no has realizado pedidos. Compra tu
                                    primer plato para ganar puntos en el Club
                                    Casa Flora.
                                </p>
                            ) : (
                                <ul className="m-0 mt-3 list-none divide-y divide-foreground-muted/15 p-0">
                                    {orders.map((order) => (
                                        <li
                                            key={order.id}
                                            className="flex flex-wrap items-center justify-between gap-3 py-3"
                                        >
                                            <div>
                                                <p className="m-0 font-display text-base font-bold text-primary">
                                                    Orden #{order.orderNumber} •{" "}
                                                    {order.items
                                                        .map(
                                                            (i) =>
                                                                `${i.quantity}x ${i.productName}`,
                                                        )
                                                        .join(", ")}
                                                </p>
                                                <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                                    {order.addressLabel} •{" "}
                                                    {order.paymentSummary}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-bold text-foreground">
                                                    {formatPrice(
                                                        order.totalAmount,
                                                    )}
                                                </span>
                                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                    +{order.pointsEarned} pts
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-6 border-t border-foreground-muted/15 pt-5">
                            <h4 className="m-0 font-display text-base font-bold text-primary">
                                Reservas de mesa ({bookings.length})
                            </h4>

                            {bookingsError && (
                                <div
                                    role="alert"
                                    className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive"
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
                                    className="mt-3 rounded-xl border border-foreground-muted/15 bg-background p-4 text-center text-xs text-foreground-muted"
                                >
                                    Consultando tus reservas registradas...
                                </div>
                            ) : bookings.length === 0 ? (
                                <p className="mt-2 rounded-xl border border-foreground-muted/15 bg-background p-4 text-xs text-foreground-muted">
                                    Aún no tienes reservas de mesa registradas.
                                </p>
                            ) : (
                                <ul className="m-0 mt-3 list-none divide-y divide-foreground-muted/15 p-0">
                                    {bookings.map((booking) => {
                                        const isConfirmed =
                                            booking.status === "confirmed";
                                        return (
                                            <li
                                                key={booking.id}
                                                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <p className="m-0 font-display text-base font-bold text-primary">
                                                        {formatEnvironmentLabel(
                                                            booking.environment,
                                                        )}
                                                    </p>
                                                    <p className="m-0 mt-0.5 text-xs text-foreground">
                                                        Fecha: {booking.date} a
                                                        las {booking.time} (
                                                        {booking.diners}{" "}
                                                        {booking.diners === 1
                                                            ? "persona"
                                                            : "personas"}
                                                        )
                                                    </p>
                                                    <p className="m-0 mt-0.5 text-xs font-semibold text-foreground-muted">
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
                                                        {cancellingId ===
                                                        booking.id
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
                )}
            </section>

            {featuredDish && (
                <section
                    aria-labelledby="profile-favorites-heading"
                    className="mt-7 sm:mt-10"
                >
                    <div className="mb-3.5 flex items-end justify-between gap-2 sm:mb-5">
                        <div className="sm:border-b-2 sm:border-[#e5c5b5] sm:pb-1.5">
                            <h2
                                id="profile-favorites-heading"
                                className="m-0 font-display text-xl font-bold text-primary sm:text-2xl"
                            >
                                Tus favoritos de siempre
                            </h2>
                            <p className="m-0 mt-0.5 text-xs text-foreground-muted md:hidden">
                                {featuredDish.subtitle}
                            </p>
                        </div>
                        <span className="text-xs font-bold text-[#bc8e56] md:hidden">
                            {featuredDish.statusLabel}
                        </span>
                    </div>

                    {orderBanner && (
                        <div
                            role="status"
                            className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
                        >
                            {orderBanner}
                        </div>
                    )}

                    <article className="rounded-2xl border border-foreground-muted/10 bg-surface p-4 shadow-(--shadow-ambient-md) md:hidden">
                        <div className="flex items-center gap-3.5">
                            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                                <Image
                                    src={featuredDish.imageUrl}
                                    alt={featuredDish.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="m-0 truncate font-display text-base font-bold text-primary">
                                    {featuredDish.name}
                                </h3>
                                <p className="m-0 mt-0.5 truncate text-xs text-foreground-muted">
                                    {featuredDish.description}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-sm font-extrabold text-foreground">
                                        {formatPrice(featuredDish.price)} COP
                                    </span>
                                    <span className="text-xs text-foreground-muted">
                                        {featuredDish.orderNumber
                                            ? `Orden #${featuredDish.orderNumber}`
                                            : "Sugerencia del chef"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="my-3.5 border-t border-foreground-muted/12" />

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2 text-xs text-foreground-muted">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="size-4 shrink-0 text-emerald-600"
                                >
                                    <circle cx="10" cy="10" r="7.5" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7 10.2l2 2 4-4"
                                    />
                                </svg>
                                <span className="truncate">
                                    {featuredDish.addressLabel}
                                </span>
                            </div>

                            <button
                                type="button"
                                disabled={isPlacingOrder}
                                onClick={() =>
                                    void handleBuyFeaturedProduct(
                                        featuredDish.productId,
                                    )
                                }
                                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#4b151b] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-95 disabled:opacity-50"
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
                                {isPlacingOrder
                                    ? "Procesando..."
                                    : featuredDish.ctaLabel}
                            </button>
                        </div>
                    </article>

                    <article className="hidden overflow-hidden rounded-2xl border border-foreground-muted/10 bg-surface shadow-(--shadow-ambient-md) md:grid md:grid-cols-12">
                        <div className="relative min-h-60 md:col-span-5">
                            <Image
                                src={featuredDish.imageUrl}
                                alt={featuredDish.name}
                                fill
                                sizes="42vw"
                                className="object-cover"
                            />
                            <span className="absolute top-4 left-4 rounded-full bg-[#e8cfc8]/90 px-3.5 py-1 text-[10px] font-bold tracking-wider text-[#554242] uppercase backdrop-blur-xs">
                                {featuredDish.badgeLabel}
                            </span>
                        </div>

                        <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-7">
                            <div>
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h3 className="m-0 font-display text-2xl font-bold text-primary sm:text-[1.75rem]">
                                        {featuredDish.name}
                                    </h3>
                                    <span className="font-display text-lg font-semibold text-secondary">
                                        {formatPrice(featuredDish.price)}
                                    </span>
                                </div>

                                <p className="m-0 mt-1 text-xs font-semibold text-accent">
                                    {featuredDish.subtitle} •{" "}
                                    {featuredDish.addressLabel}
                                </p>

                                <p className="m-0 mt-3 text-sm/6 text-foreground-muted">
                                    {featuredDish.description}
                                </p>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={isPlacingOrder}
                                    onClick={() =>
                                        void handleBuyFeaturedProduct(
                                            featuredDish.productId,
                                        )
                                    }
                                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#a87c4f] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#936a41] disabled:opacity-50"
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
                                    {isPlacingOrder
                                        ? "Procesando..."
                                        : featuredDish.ctaLabel}
                                </button>
                            </div>
                        </div>
                    </article>
                </section>
            )}

            <aside
                aria-label="Filosofía de Casa Flora"
                className="mt-7 rounded-2xl border border-[#e8d5b7]/70 bg-[#fbf5e8] px-6 py-5 text-center sm:mt-10 dark:border-foreground-muted/15 dark:bg-background-alt"
            >
                <p className="m-0 font-display text-sm/6 text-primary italic sm:text-base">
                    &ldquo;Alimentarse bien es un placer, un detalle de amor y
                    una obligación con uno mismo.&rdquo;
                </p>
                <p className="m-0 mt-2.5 text-[10px] font-bold tracking-[0.14em] text-[#ad5d4e] uppercase">
                    COCINA VIRTUAL NACIDA EN MEDELLÍN
                </p>
            </aside>
        </div>
    );
}

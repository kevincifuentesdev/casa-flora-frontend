"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { OrderRecord } from "@/features/auth/domain/session";
import { useSession } from "@/features/auth/hooks/useSession";
import { formatPrice } from "@/features/products/domain/product";
import { MAX_ITEM_QUANTITY } from "../domain/cart";
import {
    validateCheckoutDraft,
    type CheckoutValidationErrors,
    type DeliveryMethod,
} from "../domain/checkoutValidation";
import { useCart } from "../hooks/useCart";
import {
    cancelPendingCartOrder,
    createCartCheckout,
    verifyCartCheckoutPayment,
    type CheckoutSessionData,
} from "../services/checkoutService";

type PaymentStage = "idle" | "waiting" | "approved" | "rejected";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export default function CartDrawer() {
    const pathname = usePathname();
    const router = useRouter();
    const { session, refreshSession } = useSession();
    const {
        items,
        totalItems,
        subtotal,
        estimatedPoints,
        isOpen,
        openCart,
        closeCart,
        addItem,
        decrementItem,
        removeItem,
        clearCart,
    } = useCart();

    const [deliveryMethod, setDeliveryMethod] =
        useState<DeliveryMethod>("pickup");
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        null,
    );
    const [useCustomAddressOverride, setUseCustomAddressOverride] = useState<
        boolean | null
    >(null);
    const [addressLabel, setAddressLabel] = useState("Casa");
    const [addressLine, setAddressLine] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [addressDetails, setAddressDetails] = useState("");
    const [saveToProfile, setSaveToProfile] = useState(true);

    const [validationErrors, setValidationErrors] =
        useState<CheckoutValidationErrors>({});
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [isRedirectingPayment, setIsRedirectingPayment] = useState(false);

    const [paymentStage, setPaymentStage] = useState<PaymentStage>("idle");
    const [activeSession, setActiveSession] =
        useState<CheckoutSessionData | null>(null);
    const [verifiedOrder, setVerifiedOrder] = useState<OrderRecord | null>(
        null,
    );
    const [verifiedSummary, setVerifiedSummary] = useState<string>(
        "Mercado Pago • Pago aprobado",
    );
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [verificationNotice, setVerificationNotice] = useState<string | null>(
        null,
    );

    const runPaymentVerification = useCallback(
        async (
            externalReference: string,
            paymentId?: string,
            showPendingFeedback = false,
        ) => {
            setIsCheckingPayment(true);
            if (showPendingFeedback) {
                setVerificationNotice(null);
            }

            const res = await verifyCartCheckoutPayment({
                externalReference,
                ...(paymentId ? { paymentId } : {}),
            });
            setIsCheckingPayment(false);

            if (res.error || !res.verification) {
                if (showPendingFeedback) {
                    setVerificationNotice(
                        res.error ??
                            "Aún no recibimos confirmación de Mercado Pago. Completa el pago en la pestaña abierta e intenta de nuevo.",
                    );
                }
                return;
            }

            if (res.verification.status === "approved") {
                setVerifiedSummary(res.verification.paymentSummary);
                setVerifiedOrder(res.verification.order);
                setPaymentStage("approved");
                setVerificationNotice(null);
                clearCart();
                await refreshSession();
                return;
            }

            if (res.verification.status === "rejected") {
                setVerifiedSummary(res.verification.paymentSummary);
                setVerifiedOrder(res.verification.order);
                setPaymentStage("rejected");
                setVerificationNotice(null);
                await refreshSession();
                return;
            }

            if (showPendingFeedback) {
                setVerificationNotice(
                    "Mercado Pago aún reporta el pago como pendiente. Si acabas de pagar, espera unos segundos y vuelve a verificar.",
                );
            }
        },
        [clearCart, refreshSession],
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const ref =
            params.get("external_reference") ?? params.get("ref") ?? null;
        const paymentParam =
            params.get("payment") ?? params.get("collection_status") ?? null;
        const paymentId =
            params.get("payment_id") ?? params.get("collection_id") ?? undefined;

        if (!ref || !paymentParam) return;

        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);

        queueMicrotask(() => {
            openCart();
            setActiveSession((prev) =>
                prev ?? {
                    preferenceId: ref,
                    externalReference: ref,
                    checkoutUrl: "https://www.mercadopago.com.co",
                    sandboxCheckoutUrl: "https://www.mercadopago.com.co",
                    deliveryMethod: "pickup",
                    addressLabel: "Pedido en verificación",
                    totalAmount: 0,
                    pointsEarned: 0,
                    order: null,
                },
            );
            setPaymentStage("waiting");
            void runPaymentVerification(ref, paymentId, true);
        });
    }, [openCart, runPaymentVerification]);

    useEffect(() => {
        if (
            !isOpen ||
            paymentStage !== "waiting" ||
            !activeSession?.externalReference
        ) {
            return;
        }

        const extRef = activeSession.externalReference;
        const intervalId = window.setInterval(() => {
            void runPaymentVerification(extRef, undefined, false);
        }, 3200);

        const handleWindowFocus = () => {
            void runPaymentVerification(extRef, undefined, false);
        };

        window.addEventListener("focus", handleWindowFocus);
        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleWindowFocus);
        };
    }, [isOpen, paymentStage, activeSession?.externalReference, runPaymentVerification]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeCart();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeCart]);

    if (!isOpen || pathname === "/onboarding") {
        return null;
    }

    const isAuthenticated = Boolean(session?.user);
    const savedAddresses = session?.user?.addresses ?? [];
    const defaultSavedAddress =
        savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;

    const effectiveSelectedAddressId =
        selectedAddressId &&
        savedAddresses.some((a) => a.id === selectedAddressId)
            ? selectedAddressId
            : (defaultSavedAddress?.id ?? null);

    const useCustomAddress =
        savedAddresses.length === 0
            ? true
            : (useCustomAddressOverride ?? false);

    const currentPoints = session?.user?.loyalty?.points ?? 0;
    const nextRewardName =
        session?.user?.loyalty?.rewardName ?? "Recompensa artesanal";

    const handleSelectDeliveryMethod = (method: DeliveryMethod) => {
        setDeliveryMethod(method);
        setValidationErrors({});
        setCheckoutError(null);
    };

    const handleProceedToPayment = async () => {
        if (isRedirectingPayment) return;
        setCheckoutError(null);

        const errors = validateCheckoutDraft({
            items,
            deliveryMethod,
            useCustomAddress,
            selectedAddressId: effectiveSelectedAddressId,
            customAddress: {
                label: addressLabel,
                addressLine,
                neighborhood,
                city: "Medellín, Antioquia",
                details: addressDetails,
                saveToProfile,
            },
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            document
                .getElementById("cart-delivery-address-section")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setValidationErrors({});
        setIsRedirectingPayment(true);

        const result = await createCartCheckout({
            items: items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
            })),
            deliveryMethod,
            ...(deliveryMethod === "delivery"
                ? useCustomAddress
                    ? {
                          deliveryAddress: {
                              label: addressLabel.trim() || "Domicilio",
                              addressLine: addressLine.trim(),
                              neighborhood: neighborhood.trim(),
                              city: "Medellín, Antioquia",
                              details: addressDetails.trim() || null,
                              saveToProfile: isAuthenticated && saveToProfile,
                          },
                      }
                    : effectiveSelectedAddressId
                      ? { addressId: effectiveSelectedAddressId }
                      : {}
                : {}),
        });

        if (result.error || !result.session) {
            setIsRedirectingPayment(false);
            setCheckoutError(
                result.error ??
                    "No fue posible conectar con Mercado Pago en este momento.",
            );
            return;
        }

        setIsRedirectingPayment(false);
        setActiveSession(result.session);
        setVerifiedOrder(result.session.order);
        setVerificationNotice(null);
        setPaymentStage("waiting");

        if (isAuthenticated) {
            await refreshSession();
        }

        window.open(result.session.checkoutUrl, "_blank", "noopener,noreferrer");
    };

    const handleCancelWaitingCheckout = async () => {
        if (activeSession?.order?.id && isAuthenticated) {
            await cancelPendingCartOrder(activeSession.order.id);
            await refreshSession();
        }
        setPaymentStage("idle");
        setActiveSession(null);
        setVerificationNotice(null);
    };

    const handleResetAndClose = () => {
        setPaymentStage("idle");
        setActiveSession(null);
        setVerificationNotice(null);
        closeCart();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed inset-0 z-60 flex items-end justify-end bg-black/55 backdrop-blur-xs sm:items-stretch"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    handleResetAndClose();
                }
            }}
        >
            <div className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-foreground-muted/15 bg-surface shadow-(--shadow-ambient-md) sm:h-dvh sm:max-h-none sm:max-w-md sm:rounded-none sm:rounded-l-2xl sm:border-t-0 sm:border-l">
                <div className="flex items-center justify-between gap-3 border-b border-foreground-muted/15 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2
                                id="cart-drawer-title"
                                className="m-0 font-display text-2xl font-bold text-primary"
                            >
                                {paymentStage === "waiting"
                                    ? "Validando tu pago"
                                    : paymentStage === "approved"
                                      ? "¡Pedido confirmado!"
                                      : paymentStage === "rejected"
                                        ? "Pago no completado"
                                        : "Tu Bolsa"}
                            </h2>
                            {paymentStage === "idle" && totalItems > 0 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary dark:bg-primary/25 dark:text-foreground">
                                    {totalItems}{" "}
                                    {totalItems === 1 ? "plato" : "platos"}
                                </span>
                            )}
                        </div>
                        <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                            {paymentStage === "waiting"
                                ? "Completa el pago en la pestaña de Mercado Pago."
                                : paymentStage === "approved"
                                  ? "Tu pago fue verificado exitosamente con Mercado Pago."
                                  : paymentStage === "rejected"
                                    ? "Tu bolsa sigue intacta para que puedas reintentar."
                                    : "Cocina artesanal lista para compartir en tu mesa."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {paymentStage === "idle" && items.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-destructive/30 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 ${focusRing}`}
                            >
                                Vaciar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleResetAndClose}
                            aria-label="Cerrar carrito de compras"
                            className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/25 bg-background text-foreground-muted transition hover:border-primary/40 hover:text-foreground ${focusRing}`}
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="size-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 5l10 10M15 5L5 15"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                    {paymentStage === "waiting" && activeSession ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-foreground-muted/15 bg-background p-6 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="size-7 animate-pulse"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 7v5l3 2"
                                    />
                                </svg>
                            </span>

                            <h3 className="m-0 mt-4 font-display text-xl font-bold text-primary">
                                Esperando aprobación de Mercado Pago
                            </h3>
                            <p className="m-0 mt-2 text-xs/5 text-foreground-muted">
                                Abrimos la pasarela en una nueva pestaña. Apenas
                                apruebes el pago allá, esta ventana validará la
                                transacción automáticamente sin que tengas que
                                buscar un botón de regreso.
                            </p>

                            <div className="mt-4 w-full rounded-xl border border-foreground-muted/15 bg-surface p-3.5 text-left text-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-foreground-muted">
                                        Estado actual:
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-bold text-amber-800 dark:text-amber-300">
                                        Pendiente de pago
                                    </span>
                                </div>
                                {activeSession.totalAmount > 0 && (
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <span className="text-foreground-muted">
                                            Total:
                                        </span>
                                        <span className="font-bold text-foreground">
                                            {formatPrice(
                                                activeSession.totalAmount,
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-foreground-muted">
                                        Entrega:
                                    </span>
                                    <span className="truncate font-semibold text-foreground">
                                        {activeSession.addressLabel}
                                    </span>
                                </div>
                            </div>

                            {verificationNotice && (
                                <p
                                    role="status"
                                    className="mt-3 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-medium text-amber-900 dark:text-amber-200"
                                >
                                    {verificationNotice}
                                </p>
                            )}

                            <div className="mt-5 flex w-full flex-col gap-2.5">
                                <button
                                    type="button"
                                    disabled={isCheckingPayment}
                                    onClick={() =>
                                        void runPaymentVerification(
                                            activeSession.externalReference,
                                            undefined,
                                            true,
                                        )
                                    }
                                    className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 ${focusRing}`}
                                >
                                    {isCheckingPayment
                                        ? "Verificando con Mercado Pago..."
                                        : "Ya realicé el pago, verificar ahora"}
                                </button>

                                <a
                                    href={activeSession.checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/40 bg-surface px-5 py-2.5 text-xs font-bold text-primary no-underline transition hover:bg-background dark:border-foreground-muted/35 dark:text-foreground ${focusRing}`}
                                >
                                    Abrir pestaña de Mercado Pago nuevamente
                                </a>

                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleCancelWaitingCheckout()
                                    }
                                    className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-destructive/35 bg-transparent px-5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 ${focusRing}`}
                                >
                                    Cancelar y volver a mi bolsa
                                </button>
                            </div>
                        </div>
                    ) : paymentStage === "approved" ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-6 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    className="size-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </span>

                            <h3 className="m-0 mt-4 font-display text-2xl font-bold text-primary">
                                ¡Pago verificado con éxito!
                            </h3>
                            <p className="m-0 mt-2 text-xs/5 text-foreground">
                                Mercado Pago confirmó la aprobación de tu pago y
                                nuestra cocina ya está preparando tu pedido.
                            </p>

                            <div className="mt-4 w-full rounded-xl border border-foreground-muted/15 bg-surface p-4 text-left text-xs">
                                {verifiedOrder && (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-foreground-muted">
                                            Orden:
                                        </span>
                                        <span className="font-bold text-primary">
                                            #{verifiedOrder.orderNumber}
                                        </span>
                                    </div>
                                )}
                                <div className="mt-1.5 flex items-center justify-between gap-2">
                                    <span className="text-foreground-muted">
                                        Medio verificado:
                                    </span>
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                        {verifiedSummary}
                                    </span>
                                </div>
                                {verifiedOrder &&
                                    verifiedOrder.pointsEarned > 0 && (
                                        <div className="mt-1.5 flex items-center justify-between gap-2">
                                            <span className="text-foreground-muted">
                                                Puntos acreditados:
                                            </span>
                                            <span className="font-bold text-accent">
                                                +{verifiedOrder.pointsEarned} pts
                                            </span>
                                        </div>
                                    )}
                            </div>

                            <div className="mt-5 flex w-full flex-col gap-2.5">
                                {isAuthenticated && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleResetAndClose();
                                            router.push("/profile");
                                        }}
                                        className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 ${focusRing}`}
                                    >
                                        Ver mi pedido en Mi Perfil
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleResetAndClose}
                                    className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-primary/40 bg-surface px-5 py-2.5 text-xs font-bold text-primary transition hover:bg-background dark:border-foreground-muted/35 dark:text-foreground ${focusRing}`}
                                >
                                    Seguir explorando la carta
                                </button>
                            </div>
                        </div>
                    ) : paymentStage === "rejected" ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/8 p-6 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full bg-destructive text-white">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    className="size-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 6l12 12M18 6L6 18"
                                    />
                                </svg>
                            </span>

                            <h3 className="m-0 mt-4 font-display text-xl font-bold text-primary">
                                El pago fue rechazado
                            </h3>
                            <p className="m-0 mt-2 text-xs/5 text-foreground">
                                Mercado Pago reportó que la transacción no fue
                                aprobada ({verifiedSummary}). No se realizó
                                ningún cargo y tus platos siguen en la bolsa.
                            </p>

                            <div className="mt-5 flex w-full flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentStage("idle");
                                        setActiveSession(null);
                                    }}
                                    className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 ${focusRing}`}
                                >
                                    Volver a mi bolsa e intentar de nuevo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                    {!isAuthenticated ? (
                        <div className="mb-4 rounded-2xl border border-[#e5c5b5] bg-[#fbf5e8] p-4 dark:border-foreground-muted/20 dark:bg-background-alt">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="size-4 text-[#f5c58b]"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="m-0 font-display text-base font-bold text-primary">
                                        {estimatedPoints > 0
                                            ? `Suma +${estimatedPoints} ${estimatedPoints === 1 ? "punto" : "puntos"} con tu pedido`
                                            : "Gana puntos en el Club Casa Flora"}
                                    </p>
                                    <p className="m-0 mt-1 text-xs/5 text-foreground">
                                        Crea tu cuenta o inicia sesión para
                                        acumular puntos por cada plato, canjear
                                        recompensas artesanales, guardar tus
                                        direcciones y recibir recomendaciones a
                                        tu medida.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                                <Link
                                    href="/signup"
                                    onClick={closeCart}
                                    className={`inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90 ${focusRing}`}
                                >
                                    Crear cuenta
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={closeCart}
                                    className={`inline-flex min-h-11 items-center justify-center rounded-full border border-primary/40 bg-surface px-4 py-2 text-xs font-bold text-primary no-underline transition hover:bg-background dark:border-foreground-muted/35 dark:text-foreground ${focusRing}`}
                                >
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-[#691a22] to-[#4b030f] px-4 py-3 text-white shadow-xs">
                            <div className="min-w-0">
                                <p className="m-0 text-[10px] font-bold tracking-[0.12em] text-[#e8b98a] uppercase">
                                    CLUB CASA FLORA
                                </p>
                                <p className="m-0 mt-0.5 truncate text-xs text-white/90">
                                    {estimatedPoints > 0
                                        ? `Esta bolsa suma +${estimatedPoints} pts para ${nextRewardName}`
                                        : `Acumula puntos para ${nextRewardName}`}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#f5c58b] px-3 py-1 text-xs font-bold text-[#2b1d19]">
                                {currentPoints} pts
                            </span>
                        </div>
                    )}

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-foreground-muted/15 bg-background px-5 py-10 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full bg-[#f6ded8] text-[#691a22]">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"
                                    />
                                </svg>
                            </span>
                            <h3 className="m-0 mt-4 font-display text-xl font-bold text-primary">
                                Tu bolsa está vacía
                            </h3>
                            <p className="m-0 mt-1.5 max-w-xs text-xs/5 text-foreground-muted">
                                Aún no has agregado platos de nuestra cocina.
                                Explora la carta y añade tus favoritos sin
                                necesidad de iniciar sesión.
                            </p>
                            <Link
                                href="/menu"
                                onClick={closeCart}
                                className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90 ${focusRing}`}
                            >
                                Explorar el menú
                            </Link>
                        </div>
                    ) : (
                        <>
                            <ul
                                aria-label="Productos en tu bolsa"
                                className="m-0 list-none divide-y divide-foreground-muted/15 p-0"
                            >
                                {items.map((item) => {
                                    const lineTotal =
                                        item.product.price * item.quantity;
                                    const isMaxReached =
                                        item.quantity >= MAX_ITEM_QUANTITY;

                                    return (
                                        <li
                                            key={item.product.id}
                                            className="py-4 first:pt-1 last:pb-1"
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="relative size-18 shrink-0 overflow-hidden rounded-xl border border-foreground-muted/10 bg-background">
                                                    <Image
                                                        src={
                                                            item.product
                                                                .imageUrl
                                                        }
                                                        alt={item.product.name}
                                                        fill
                                                        sizes="72px"
                                                        className="object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="m-0 font-display text-base leading-snug font-bold text-primary">
                                                            {item.product.name}
                                                        </h3>
                                                        <span className="shrink-0 text-sm font-extrabold text-foreground">
                                                            {formatPrice(
                                                                lineTotal,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                                        {formatPrice(
                                                            item.product.price,
                                                        )}{" "}
                                                        c/u
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                        <div
                                                            role="group"
                                                            aria-label={`Cantidad de ${item.product.name}`}
                                                            className="inline-flex items-center rounded-full border border-foreground-muted/25 bg-background p-0.5"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    decrementItem(
                                                                        item
                                                                            .product
                                                                            .id,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    item.quantity ===
                                                                    1
                                                                        ? `Quitar ${item.product.name} de la bolsa`
                                                                        : `Disminuir cantidad de ${item.product.name}`
                                                                }
                                                                className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-sm font-bold text-foreground transition hover:bg-primary/10 active:scale-95 ${focusRing}`}
                                                            >
                                                                -
                                                            </button>
                                                            <span
                                                                aria-live="polite"
                                                                className="min-w-8 text-center text-xs font-bold text-foreground"
                                                            >
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    isMaxReached
                                                                }
                                                                onClick={() =>
                                                                    addItem(
                                                                        item.product,
                                                                        1,
                                                                    )
                                                                }
                                                                aria-label={`Aumentar cantidad de ${item.product.name}`}
                                                                className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-sm font-bold text-foreground transition hover:bg-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeItem(
                                                                    item.product
                                                                        .id,
                                                                )
                                                            }
                                                            aria-label={`Eliminar ${item.product.name} del carrito`}
                                                            className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/30 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 ${focusRing}`}
                                                        >
                                                            <svg
                                                                aria-hidden="true"
                                                                viewBox="0 0 20 20"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                className="size-3.5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6 6l8 8M14 6l-8 8"
                                                                />
                                                            </svg>
                                                            <span>
                                                                Eliminar
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div
                                id="cart-delivery-address-section"
                                className="mt-5 border-t border-foreground-muted/15 pt-4"
                            >
                                <p className="m-0 font-display text-base font-bold text-primary">
                                    Modalidad de entrega
                                </p>
                                <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                    Elige cómo deseas recibir tu pedido antes de
                                    ir a la pasarela de pago.
                                </p>

                                <div
                                    role="radiogroup"
                                    aria-label="Modalidad de entrega"
                                    className="mt-3 grid grid-cols-2 gap-2.5"
                                >
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={
                                            deliveryMethod === "pickup"
                                        }
                                        onClick={() =>
                                            handleSelectDeliveryMethod("pickup")
                                        }
                                        className={`flex min-h-14 cursor-pointer flex-col items-start justify-center rounded-xl border p-3 text-left transition ${focusRing} ${
                                            deliveryMethod === "pickup"
                                                ? "border-primary bg-primary/8 ring-1 ring-primary"
                                                : "border-foreground-muted/25 bg-background hover:border-primary/40"
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                            <svg
                                                aria-hidden="true"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="size-4 shrink-0"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 9l1.5-5h11L17 9M4 9v8h12V9M8 17v-5h4v5"
                                                />
                                            </svg>
                                            Recoger en lugar
                                        </span>
                                        <span className="mt-0.5 text-[11px] text-foreground-muted">
                                            Sede El Poblado
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={
                                            deliveryMethod === "delivery"
                                        }
                                        onClick={() =>
                                            handleSelectDeliveryMethod(
                                                "delivery",
                                            )
                                        }
                                        className={`flex min-h-14 cursor-pointer flex-col items-start justify-center rounded-xl border p-3 text-left transition ${focusRing} ${
                                            deliveryMethod === "delivery"
                                                ? "border-primary bg-primary/8 ring-1 ring-primary"
                                                : "border-foreground-muted/25 bg-background hover:border-primary/40"
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                            <svg
                                                aria-hidden="true"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="size-4 shrink-0"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10 18s-5-4.35-5-8.5a5 5 0 1110 0c0 4.15-5 8.5-5 8.5z"
                                                />
                                                <circle
                                                    cx="10"
                                                    cy="9.5"
                                                    r="1.8"
                                                />
                                            </svg>
                                            Recibir a domicilio
                                        </span>
                                        <span className="mt-0.5 text-[11px] text-foreground-muted">
                                            Requiere dirección
                                        </span>
                                    </button>
                                </div>

                                {deliveryMethod === "pickup" ? (
                                    <div className="mt-3 rounded-xl border border-foreground-muted/15 bg-background p-3 text-xs text-foreground-muted">
                                        <strong className="font-semibold text-foreground">
                                            Punto de recogida:
                                        </strong>{" "}
                                        Calle 10 # 43A-30, El Poblado, Medellín.
                                        Tu pedido estará listo en 20 a 30
                                        minutos.
                                    </div>
                                ) : (
                                    <div className="mt-3 rounded-xl border border-foreground-muted/20 bg-background p-3.5">
                                        {savedAddresses.length > 0 && (
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-foreground">
                                                        Dirección de entrega
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUseCustomAddressOverride(
                                                                !useCustomAddress,
                                                            );
                                                            setValidationErrors(
                                                                {},
                                                            );
                                                        }}
                                                        className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-none bg-transparent px-2 text-xs font-bold text-accent underline ${focusRing}`}
                                                    >
                                                        {useCustomAddress
                                                            ? "Usar dirección guardada"
                                                            : "Ingresar otra dirección"}
                                                    </button>
                                                </div>

                                                {!useCustomAddress && (
                                                    <div className="mt-2 flex flex-col gap-2">
                                                        {savedAddresses.map(
                                                            (addr) => {
                                                                const isSelected =
                                                                    effectiveSelectedAddressId ===
                                                                    addr.id;
                                                                return (
                                                                    <button
                                                                        key={
                                                                            addr.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedAddressId(
                                                                                addr.id,
                                                                            );
                                                                            setValidationErrors(
                                                                                {},
                                                                            );
                                                                        }}
                                                                        className={`flex min-h-12 cursor-pointer flex-col items-start justify-center rounded-lg border px-3 py-2 text-left transition ${focusRing} ${
                                                                            isSelected
                                                                                ? "border-primary bg-primary/6 ring-1 ring-primary"
                                                                                : "border-foreground-muted/20 bg-surface hover:border-primary/40"
                                                                        }`}
                                                                    >
                                                                        <span className="text-xs font-bold text-primary">
                                                                            {
                                                                                addr.label
                                                                            }{" "}
                                                                            ({
                                                                                addr.neighborhood
                                                                            })
                                                                        </span>
                                                                        <span className="text-[11px] text-foreground-muted">
                                                                            {
                                                                                addr.addressLine
                                                                            }
                                                                            {addr.details
                                                                                ? `, ${addr.details}`
                                                                                : ""}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}

                                                {validationErrors.addressSelection && (
                                                    <p
                                                        role="alert"
                                                        className="mt-1.5 text-xs font-semibold text-destructive"
                                                    >
                                                        {
                                                            validationErrors.addressSelection
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {useCustomAddress && (
                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                                <div className="sm:col-span-2">
                                                    <label
                                                        htmlFor="cart-address-line"
                                                        className="block text-xs font-semibold text-foreground"
                                                    >
                                                        Dirección de entrega *
                                                    </label>
                                                    <input
                                                        id="cart-address-line"
                                                        type="text"
                                                        placeholder="Ej. Calle 10 # 43A-30"
                                                        value={addressLine}
                                                        onChange={(event) => {
                                                            setAddressLine(
                                                                event.target
                                                                    .value,
                                                            );
                                                            setValidationErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    addressLine:
                                                                        undefined,
                                                                }),
                                                            );
                                                        }}
                                                        aria-invalid={
                                                            !!validationErrors.addressLine
                                                        }
                                                        className={`mt-1 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-surface px-3 py-2 text-xs text-foreground ${focusRing}`}
                                                    />
                                                    {validationErrors.addressLine && (
                                                        <p
                                                            role="alert"
                                                            className="mt-1 text-xs font-semibold text-destructive"
                                                        >
                                                            {
                                                                validationErrors.addressLine
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="cart-address-neighborhood"
                                                        className="block text-xs font-semibold text-foreground"
                                                    >
                                                        Barrio *
                                                    </label>
                                                    <input
                                                        id="cart-address-neighborhood"
                                                        type="text"
                                                        placeholder="Ej. El Poblado"
                                                        value={neighborhood}
                                                        onChange={(event) => {
                                                            setNeighborhood(
                                                                event.target
                                                                    .value,
                                                            );
                                                            setValidationErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    neighborhood:
                                                                        undefined,
                                                                }),
                                                            );
                                                        }}
                                                        aria-invalid={
                                                            !!validationErrors.neighborhood
                                                        }
                                                        className={`mt-1 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-surface px-3 py-2 text-xs text-foreground ${focusRing}`}
                                                    />
                                                    {validationErrors.neighborhood && (
                                                        <p
                                                            role="alert"
                                                            className="mt-1 text-xs font-semibold text-destructive"
                                                        >
                                                            {
                                                                validationErrors.neighborhood
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="cart-address-label"
                                                        className="block text-xs font-semibold text-foreground"
                                                    >
                                                        Etiqueta
                                                    </label>
                                                    <input
                                                        id="cart-address-label"
                                                        type="text"
                                                        placeholder="Casa, Oficina"
                                                        value={addressLabel}
                                                        onChange={(event) =>
                                                            setAddressLabel(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={`mt-1 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-surface px-3 py-2 text-xs text-foreground ${focusRing}`}
                                                    />
                                                </div>

                                                <div className="sm:col-span-2">
                                                    <label
                                                        htmlFor="cart-address-details"
                                                        className="block text-xs font-semibold text-foreground"
                                                    >
                                                        Detalles de entrega
                                                        (opcional)
                                                    </label>
                                                    <input
                                                        id="cart-address-details"
                                                        type="text"
                                                        placeholder="Apto, torre o indicaciones para portería"
                                                        value={addressDetails}
                                                        onChange={(event) =>
                                                            setAddressDetails(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={`mt-1 min-h-11 w-full rounded-lg border border-foreground-muted/30 bg-surface px-3 py-2 text-xs text-foreground ${focusRing}`}
                                                    />
                                                </div>

                                                {isAuthenticated && (
                                                    <label className="mt-1 flex min-h-9 cursor-pointer items-center gap-2 text-xs text-foreground sm:col-span-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                saveToProfile
                                                            }
                                                            onChange={(event) =>
                                                                setSaveToProfile(
                                                                    event.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="size-4 accent-primary"
                                                        />
                                                        <span>
                                                            Guardar esta
                                                            dirección en mi
                                                            perfil
                                                        </span>
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                        </>
                    )}
                </div>

                {paymentStage === "idle" && items.length > 0 && (
                    <div className="border-t border-foreground-muted/15 bg-background px-5 py-4 pb-6 sm:px-6">
                        {checkoutError && (
                            <div
                                role="alert"
                                className="mb-3 rounded-xl border border-destructive/35 bg-destructive/10 px-3.5 py-2.5 text-xs font-semibold text-destructive"
                            >
                                {checkoutError}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-foreground-muted">
                            <span>
                                {deliveryMethod === "delivery"
                                    ? "Envío a domicilio"
                                    : "Recogida en local"}
                            </span>
                            <span className="font-semibold text-accent">
                                +{estimatedPoints}{" "}
                                {estimatedPoints === 1
                                    ? "punto estimado"
                                    : "puntos estimados"}
                            </span>
                        </div>

                        <div className="mt-1.5 flex items-baseline justify-between">
                            <span className="font-display text-lg font-bold text-primary">
                                Total a pagar
                            </span>
                            <span className="font-display text-2xl font-bold text-primary">
                                {formatPrice(subtotal)}
                            </span>
                        </div>

                        <div className="mt-3.5 flex flex-col gap-2">
                            <button
                                type="button"
                                disabled={isRedirectingPayment}
                                onClick={() => void handleProceedToPayment()}
                                className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-(--shadow-ambient-sm) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="size-4 shrink-0"
                                >
                                    <rect
                                        x="2.5"
                                        y="4.5"
                                        width="15"
                                        height="11"
                                        rx="2"
                                    />
                                    <path d="M2.5 8.5h15M6 12.5h3" />
                                </svg>
                                <span>
                                    {isRedirectingPayment
                                        ? "Redirigiendo a Mercado Pago..."
                                        : "Pagar con Mercado Pago"}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={closeCart}
                                className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-foreground-muted/25 bg-surface px-5 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 ${focusRing}`}
                            >
                                Seguir agregando platos
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
    DietPreference,
    FavoriteMoment,
    PaymentMethodType,
    SpiceTolerance,
} from "@/features/auth/domain/session";
import { useSession } from "@/features/auth/hooks/useSession";
import {
    type CompleteOnboardingPayload,
    completeUserOnboarding,
} from "@/features/auth/services/authService";

type StepIndex = 1 | 2 | 3;

const ADDRESS_LABELS = ["Casa", "Oficina", "Apartamento"] as const;
const CARD_BRANDS = ["Visa", "Mastercard", "American Express"] as const;
const PSE_BANKS = ["Bancolombia / Nequi", "Davivienda", "PSE General"] as const;

export function OnboardingOverlay() {
    const router = useRouter();
    const { session, refreshSession } = useSession();

    const [step, setStep] = useState<StepIndex>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [skipAddress, setSkipAddress] = useState(false);
    const [addressLabel, setAddressLabel] = useState<string>("Casa");
    const [addressLine, setAddressLine] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [details, setDetails] = useState("");

    const [skipPayment, setSkipPayment] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>("card");
    const [cardBrand, setCardBrand] = useState<string>("Visa");
    const [lastFour, setLastFour] = useState("");
    const [holderName, setHolderName] = useState("");
    const [pseBank, setPseBank] = useState<string>("Bancolombia / Nequi");

    const [dietPreference, setDietPreference] =
        useState<DietPreference | null>(null);
    const [spiceTolerance, setSpiceTolerance] =
        useState<SpiceTolerance | null>(null);
    const [favoriteMoment, setFavoriteMoment] =
        useState<FavoriteMoment | null>(null);

    const handleContinueFromAddress = (skipped: boolean) => {
        setErrorMessage(null);
        if (!skipped) {
            if (addressLine.trim().length < 5 || neighborhood.trim().length < 2) {
                setErrorMessage(
                    "Ingresa tu dirección y barrio, o pulsa Omitir este paso para configurarla después.",
                );
                return;
            }
        }
        setSkipAddress(skipped);
        setStep(2);
    };

    const handleContinueFromPayment = (skipped: boolean) => {
        setErrorMessage(null);
        if (!skipped && paymentType === "card") {
            if (!/^\d{4}$/.test(lastFour.trim())) {
                setErrorMessage(
                    "Ingresa los últimos 4 dígitos de tu tarjeta, o pulsa Omitir este paso.",
                );
                return;
            }
        }
        setSkipPayment(skipped);
        setStep(3);
    };

    const finishOnboarding = async (skipQuestionnaire: boolean) => {
        setErrorMessage(null);
        setIsSubmitting(true);

        const payload: CompleteOnboardingPayload = {};

        if (
            !skipAddress &&
            addressLine.trim().length >= 5 &&
            neighborhood.trim().length >= 2
        ) {
            payload.address = {
                label: addressLabel.trim() || "Casa",
                addressLine: addressLine.trim(),
                neighborhood: neighborhood.trim(),
                city: "Medellín, Antioquia",
                details: details.trim() || null,
                isDefault: true,
            };
        }

        if (!skipPayment) {
            if (paymentType === "card" && /^\d{4}$/.test(lastFour.trim())) {
                payload.paymentMethod = {
                    type: "card",
                    brand: cardBrand,
                    lastFour: lastFour.trim(),
                    holderName:
                        holderName.trim() || session?.user?.name || null,
                    isDefault: true,
                };
            } else if (paymentType === "pse") {
                payload.paymentMethod = {
                    type: "pse",
                    brand: pseBank,
                    lastFour: null,
                    holderName: session?.user?.name || null,
                    isDefault: true,
                };
            } else if (paymentType === "cash") {
                payload.paymentMethod = {
                    type: "cash",
                    brand: "Efectivo contra entrega",
                    lastFour: null,
                    holderName: null,
                    isDefault: true,
                };
            }
        }

        if (!skipQuestionnaire) {
            if (dietPreference) payload.dietPreference = dietPreference;
            if (spiceTolerance) payload.spiceTolerance = spiceTolerance;
            if (favoriteMoment) payload.favoriteMoment = favoriteMoment;
        }

        const result = await completeUserOnboarding(payload);
        setIsSubmitting(false);

        if (result.error) {
            setErrorMessage(result.error);
            return;
        }

        await refreshSession();
        router.push("/profile");
    };

    const handleSkipAll = async () => {
        setErrorMessage(null);
        setIsSubmitting(true);
        await completeUserOnboarding({});
        await refreshSession();
        setIsSubmitting(false);
        router.push("/profile");
    };

    const firstName = session?.user?.firstName || "Comensal";

    return (
        <div className="fixed inset-0 z-100 flex min-h-dvh flex-col overflow-y-auto bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-4 py-6 sm:px-8 sm:py-10">
                <div className="flex items-center justify-between gap-3 border-b border-foreground-muted/15 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#bc8e56] bg-[#fbf7f2] p-1">
                            <Image
                                src="/img/temp_logo.png"
                                alt="Casa Flora"
                                width={40}
                                height={40}
                                className="size-full object-contain"
                            />
                        </div>
                        <div>
                            <p className="m-0 font-display text-lg font-bold text-primary">
                                Casa Flora
                            </p>
                            <p className="m-0 text-xs text-foreground-muted">
                                Paso {step} de 3 (Opcional)
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void handleSkipAll()}
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/25 bg-surface px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                        Omitir todo
                    </button>
                </div>

                <div className="mt-4 flex gap-2" aria-hidden="true">
                    {[1, 2, 3].map((idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                idx <= step
                                    ? "bg-primary"
                                    : "bg-foreground-muted/20"
                            }`}
                        />
                    ))}
                </div>

                <div className="my-6 flex-1 sm:my-8">
                    {errorMessage && (
                        <div
                            role="alert"
                            className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive"
                        >
                            {errorMessage}
                        </div>
                    )}

                    {step === 1 && (
                        <section
                            aria-labelledby="onboarding-step1-title"
                            className="rounded-2xl border border-foreground-muted/12 bg-surface p-5 shadow-(--shadow-ambient-md) sm:p-8"
                        >
                            <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-[#ad5d4e] uppercase">
                                BIENVENIDO A CASA, {firstName.toUpperCase()}
                            </p>
                            <h1
                                id="onboarding-step1-title"
                                className="m-0 mt-1.5 font-display text-2xl font-bold text-primary sm:text-3xl"
                            >
                                ¿A dónde llevamos el sabor de casa?
                            </h1>
                            <p className="m-0 mt-2 text-sm text-foreground-muted">
                                Registra tu dirección principal en Medellín o el
                                Valle de Aburrá. Puedes omitir este paso y
                                completarlo más adelante desde tu perfil.
                            </p>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <span className="block text-xs font-bold text-foreground">
                                        Etiqueta del lugar
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {ADDRESS_LABELS.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() =>
                                                    setAddressLabel(item)
                                                }
                                                className={`min-h-11 cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition ${
                                                    addressLabel === item
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-foreground-muted/25 bg-background text-foreground hover:border-primary"
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="onb-address-line"
                                            className="block text-xs font-bold text-foreground"
                                        >
                                            Dirección exacta
                                        </label>
                                        <input
                                            id="onb-address-line"
                                            type="text"
                                            placeholder="ej. Calle 10 # 43A-30"
                                            value={addressLine}
                                            onChange={(e) =>
                                                setAddressLine(e.target.value)
                                            }
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/30 bg-background px-3.5 py-2.5 text-sm text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="onb-neighborhood"
                                            className="block text-xs font-bold text-foreground"
                                        >
                                            Barrio o sector
                                        </label>
                                        <input
                                            id="onb-neighborhood"
                                            type="text"
                                            placeholder="ej. El Poblado, Laureles"
                                            value={neighborhood}
                                            onChange={(e) =>
                                                setNeighborhood(e.target.value)
                                            }
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/30 bg-background px-3.5 py-2.5 text-sm text-foreground"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="onb-address-details"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Referencias o apartamento (opcional)
                                    </label>
                                    <input
                                        id="onb-address-details"
                                        type="text"
                                        placeholder="ej. Apto 502, dejar en portería"
                                        value={details}
                                        onChange={(e) =>
                                            setDetails(e.target.value)
                                        }
                                        className="mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/30 bg-background px-3.5 py-2.5 text-sm text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleContinueFromAddress(true)
                                    }
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-6 py-2.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
                                >
                                    Omitir este paso
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleContinueFromAddress(false)
                                    }
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:opacity-90"
                                >
                                    Guardar y continuar
                                </button>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section
                            aria-labelledby="onboarding-step2-title"
                            className="rounded-2xl border border-foreground-muted/12 bg-surface p-5 shadow-(--shadow-ambient-md) sm:p-8"
                        >
                            <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-[#ad5d4e] uppercase">
                                PASO 2 DE 3 • MÉTODOS DE PAGO
                            </p>
                            <h1
                                id="onboarding-step2-title"
                                className="m-0 mt-1.5 font-display text-2xl font-bold text-primary sm:text-3xl"
                            >
                                ¿Cómo prefieres pagar tus pedidos?
                            </h1>
                            <p className="m-0 mt-2 text-sm text-foreground-muted">
                                Configura tu medio de pago favorito para comprar
                                en un toque y sumar puntos en cada orden.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {(
                                    [
                                        {
                                            id: "card",
                                            title: "Tarjeta",
                                            desc: "Crédito o débito",
                                        },
                                        {
                                            id: "pse",
                                            title: "PSE / Nequi",
                                            desc: "Transferencia rápida",
                                        },
                                        {
                                            id: "cash",
                                            title: "Contra entrega",
                                            desc: "Efectivo o datáfono",
                                        },
                                    ] as const
                                ).map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() =>
                                            setPaymentType(option.id)
                                        }
                                        className={`flex min-h-20 cursor-pointer flex-col items-start justify-center rounded-xl border p-4 text-left transition ${
                                            paymentType === option.id
                                                ? "border-primary bg-primary/6 ring-1 ring-primary"
                                                : "border-foreground-muted/20 bg-background hover:border-primary/50"
                                        }`}
                                    >
                                        <span className="font-display text-base font-bold text-primary">
                                            {option.title}
                                        </span>
                                        <span className="mt-0.5 text-xs text-foreground-muted">
                                            {option.desc}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {paymentType === "card" && (
                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label
                                            htmlFor="onb-card-brand"
                                            className="block text-xs font-bold text-foreground"
                                        >
                                            Franquicia
                                        </label>
                                        <select
                                            id="onb-card-brand"
                                            value={cardBrand}
                                            onChange={(e) =>
                                                setCardBrand(e.target.value)
                                            }
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/30 bg-background px-3.5 py-2.5 text-sm text-foreground"
                                        >
                                            {CARD_BRANDS.map((brand) => (
                                                <option
                                                    key={brand}
                                                    value={brand}
                                                >
                                                    {brand}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="onb-card-last4"
                                            className="block text-xs font-bold text-foreground"
                                        >
                                            Últimos 4 dígitos
                                        </label>
                                        <input
                                            id="onb-card-last4"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={4}
                                            placeholder="4912"
                                            value={lastFour}
                                            onChange={(e) =>
                                                setLastFour(
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/30 bg-background px-3.5 py-2.5 text-sm text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="onb-card-holder"
                                            className="block text-xs font-bold text-foreground"
                                        >
                                            Titular (opcional)
                                        </label>
                                        <input
                                            id="onb-card-holder"
                                            type="text"
                                            placeholder={
                                                session?.user?.name ||
                                                "Nombre en la tarjeta"
                                            }
                                            value={holderName}
                                            onChange={(e) =>
                                                setHolderName(e.target.value)
                                            }
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/30 bg-background px-3.5 py-2.5 text-sm text-foreground"
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentType === "pse" && (
                                <div className="mt-5">
                                    <label
                                        htmlFor="onb-pse-bank"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Entidad bancaria preferida
                                    </label>
                                    <select
                                        id="onb-pse-bank"
                                        value={pseBank}
                                        onChange={(e) =>
                                            setPseBank(e.target.value)
                                        }
                                        className="mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/30 bg-background px-3.5 py-2.5 text-sm text-foreground"
                                    >
                                        {PSE_BANKS.map((bank) => (
                                            <option key={bank} value={bank}>
                                                {bank}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {paymentType === "cash" && (
                                <p className="mt-5 rounded-xl border border-foreground-muted/15 bg-background p-4 text-xs text-foreground-muted">
                                    Dejaremos registrado Pago contra entrega
                                    como tu método principal. Podrás pagar en
                                    efectivo o con datáfono al recibir tu
                                    pedido.
                                </p>
                            )}

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm: items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-5 py-2.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
                                >
                                    Atrás
                                </button>
                                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleContinueFromPayment(true)
                                        }
                                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-5 py-2.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
                                    >
                                        Omitir este paso
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleContinueFromPayment(false)
                                        }
                                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:opacity-90"
                                    >
                                        Guardar y continuar
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section
                            aria-labelledby="onboarding-step3-title"
                            className="rounded-2xl border border-foreground-muted/12 bg-surface p-5 shadow-(--shadow-ambient-md) sm:p-8"
                        >
                            <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-[#ad5d4e] uppercase">
                                PASO 3 DE 3 • TU PALADAR EN CASA FLORA
                            </p>
                            <h1
                                id="onboarding-step3-title"
                                className="m-0 mt-1.5 font-display text-2xl font-bold text-primary sm:text-3xl"
                            >
                                Cuéntanos tus secretos en la mesa
                            </h1>
                            <p className="m-0 mt-2 text-sm text-foreground-muted">
                                Responde estas preguntas rápidas para que
                                nuestra cocina te recomiende los platos ideales
                                para tu dieta.
                            </p>

                            <div className="mt-6 space-y-6">
                                <div>
                                    <h2 className="m-0 font-display text-lg font-bold text-primary">
                                        1. ¿Te gustan más las vacas o los
                                        árboles?
                                    </h2>
                                    <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                        {(
                                            [
                                                {
                                                    id: "cows",
                                                    title: "Las vacas",
                                                    desc: "Amante de los cortes tradicionales, chicharrón y bandeja paisa.",
                                                },
                                                {
                                                    id: "trees",
                                                    title: "Los árboles",
                                                    desc: "Prefiero recetas 100% vegetales, frescas y de la huerta.",
                                                },
                                                {
                                                    id: "both",
                                                    title: "De todo un poco",
                                                    desc: "Equilibrio entre tradición montañera y opciones ligeras.",
                                                },
                                            ] as const
                                        ).map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() =>
                                                    setDietPreference(item.id)
                                                }
                                                className={`flex min-h-24 cursor-pointer flex-col justify-between rounded-xl border p-3.5 text-left transition ${
                                                    dietPreference === item.id
                                                        ? "border-primary bg-primary/6 ring-1 ring-primary"
                                                        : "border-foreground-muted/20 bg-background hover:border-primary/50"
                                                }`}
                                            >
                                                <span className="font-display text-base font-bold text-primary">
                                                    {item.title}
                                                </span>
                                                <span className="mt-1 text-xs text-foreground-muted">
                                                    {item.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="m-0 font-display text-lg font-bold text-primary">
                                        2. ¿Qué dice tu corazón cuando ve el ají
                                        casero?
                                    </h2>
                                    <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                        {(
                                            [
                                                {
                                                    id: "none",
                                                    title: "De lejitos",
                                                    desc: "Cero picante, puro hogao suave.",
                                                },
                                                {
                                                    id: "mild",
                                                    title: "Un guiño suave",
                                                    desc: "Un toque de ají dulce colombiano.",
                                                },
                                                {
                                                    id: "spicy",
                                                    title: "Sin miedo al éxito",
                                                    desc: "Ají picante de la casa en cada bocado.",
                                                },
                                            ] as const
                                        ).map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() =>
                                                    setSpiceTolerance(item.id)
                                                }
                                                className={`flex min-h-20 cursor-pointer flex-col justify-between rounded-xl border p-3.5 text-left transition ${
                                                    spiceTolerance === item.id
                                                        ? "border-primary bg-primary/6 ring-1 ring-primary"
                                                        : "border-foreground-muted/20 bg-background hover:border-primary/50"
                                                }`}
                                            >
                                                <span className="font-display text-base font-bold text-primary">
                                                    {item.title}
                                                </span>
                                                <span className="mt-1 text-xs text-foreground-muted">
                                                    {item.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="m-0 font-display text-lg font-bold text-primary">
                                        3. ¿Cuál es tu momento sagrado en la
                                        mesa?
                                    </h2>
                                    <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                        {(
                                            [
                                                {
                                                    id: "almuerzo",
                                                    title: "El almuerzo",
                                                    desc: "Plato fuerte generoso como en casa.",
                                                },
                                                {
                                                    id: "tarde",
                                                    title: "Media tarde",
                                                    desc: "Empanadas crujientes y entradas.",
                                                },
                                                {
                                                    id: "postre",
                                                    title: "El toque dulce",
                                                    desc: "Postre artesanal para cerrar el día.",
                                                },
                                            ] as const
                                        ).map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() =>
                                                    setFavoriteMoment(item.id)
                                                }
                                                className={`flex min-h-20 cursor-pointer flex-col justify-between rounded-xl border p-3.5 text-left transition ${
                                                    favoriteMoment === item.id
                                                        ? "border-primary bg-primary/6 ring-1 ring-primary"
                                                        : "border-foreground-muted/20 bg-background hover:border-primary/50"
                                                }`}
                                            >
                                                <span className="font-display text-base font-bold text-primary">
                                                    {item.title}
                                                </span>
                                                <span className="mt-1 text-xs text-foreground-muted">
                                                    {item.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setStep(2)}
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-5 py-2.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground disabled:opacity-50"
                                >
                                    Atrás
                                </button>
                                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            void finishOnboarding(true)
                                        }
                                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/30 bg-transparent px-5 py-2.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground disabled:opacity-50"
                                    >
                                        Omitir cuestionario
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            void finishOnboarding(false)
                                        }
                                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isSubmitting
                                            ? "Guardando preferencias..."
                                            : "Finalizar y ver mi perfil"}
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <p className="m-0 text-center text-xs text-foreground-muted">
                    Todos los datos son opcionales y puedes modificarlos en
                    cualquier momento desde tu perfil.
                </p>
            </div>
        </div>
    );
}


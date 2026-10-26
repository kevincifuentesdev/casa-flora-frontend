"use client";

import Link from "next/link";
import { ArrowRight } from "reicon-react";

import Button from "@/features/common/components/Button";
import { useBookingForm } from "../hooks/useBookingForm";
import Calendar from "./Calendar";
import DinersCounter from "./DinersCounter";
import EnvironmentSelector from "./EnvironmentSelector";
import TimeSlots from "./TimeSlots";

const textureImage =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")";

export default function BookingForm() {
    const {
        submit,
        isSubmitting,
        submitError,
        requiresAuth,
        confirmedBooking,
        resetBookingForm,
    } = useBookingForm();

    if (confirmedBooking) {
        return (
            <div className="relative rounded-xl bg-surface p-6 shadow-(--shadow-ambient-md) transition-colors duration-400 md:p-8 lg:p-10">
                <div className="flex flex-col gap-5 text-center">
                    <h1 className="m-0 font-display text-3xl text-primary md:text-4xl">
                        Reserva Confirmada
                    </h1>
                    <p className="m-0 text-base text-foreground-muted">
                        Tu mesa en Casa Flora ha sido reservada. Te esperamos
                        para compartir nuestra mesa.
                    </p>

                    <dl className="mx-auto grid w-full max-w-md grid-cols-2 gap-3 rounded-lg border border-border/25 bg-background-alt p-4 text-left text-sm">
                        <div>
                            <dt className="font-semibold text-foreground-muted">
                                Ambiente
                            </dt>
                            <dd className="m-0 mt-0.5 font-bold text-foreground capitalize">
                                {confirmedBooking.environment}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-foreground-muted">
                                Fecha
                            </dt>
                            <dd className="m-0 mt-0.5 font-bold text-foreground">
                                {confirmedBooking.date}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-foreground-muted">
                                Horario
                            </dt>
                            <dd className="m-0 mt-0.5 font-bold text-foreground">
                                {confirmedBooking.time}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-foreground-muted">
                                Comensales
                            </dt>
                            <dd className="m-0 mt-0.5 font-bold text-foreground">
                                {confirmedBooking.diners}{" "}
                                {confirmedBooking.diners === 1
                                    ? "persona"
                                    : "personas"}
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/profile"
                            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground no-underline transition hover:opacity-90 active:scale-95"
                        >
                            Ver mis reservas
                        </Link>
                        <button
                            type="button"
                            onClick={resetBookingForm}
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary active:scale-95"
                        >
                            Hacer otra reserva
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-xl bg-surface p-6 shadow-(--shadow-ambient-md) transition-colors duration-400 md:p-8 lg:p-10">
            <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 size-full rounded-xl opacity-[0.03]"
                style={{ backgroundImage: textureImage }}
            />
            <form
                id="booking-form"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                }}
                className="relative z-1 flex flex-col gap-6"
            >
                <h1 className="m-0 mb-2 text-center font-display text-[2.75rem]/9 text-primary md:text-[2rem]/10">
                    Reserva tu Experiencia
                </h1>

                {submitError && (
                    <div
                        role="alert"
                        className="flex flex-col items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center"
                    >
                        <span>{submitError}</span>
                        {requiresAuth && (
                            <Link
                                href="/login"
                                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>
                )}

                <EnvironmentSelector />
                <Calendar />
                <TimeSlots />

                <div className="mt-2 flex flex-col gap-4 border-t border-foreground-muted/15 pt-4 md:flex-row md:items-end dark:border-foreground-muted/10">
                    <DinersCounter />
                    <div className="flex flex-col gap-4 md:flex-2">
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={isSubmitting}
                            className="w-full gap-2 rounded-lg! px-6! py-4! text-sm/5 font-bold tracking-wider shadow-(--shadow-ambient-md) hover:scale-[1.02] hover:opacity-100! hover:shadow-[0_8px_24px_rgb(38_24_20/12%)] active:scale-[0.97]"
                        >
                            <span>
                                {isSubmitting
                                    ? "Confirmando reserva..."
                                    : "Reservar"}
                            </span>
                            <ArrowRight className="size-5 shrink-0" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

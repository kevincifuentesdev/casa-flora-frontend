"use client";

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
    const { submit, isSubmitting } = useBookingForm();

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
                            <span>Reservar</span>
                            <ArrowRight className="size-5 shrink-0" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

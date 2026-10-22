"use client";

import { Add, Minus } from "reicon-react";

import Button from "@/features/common/components/Button";
import { useBookingFormContext } from "../context/BookingFormContext";
import { FieldError, fieldErrorClasses } from "./FieldError";

const btn = "size-11 rounded-none! p-0! hover:bg-primary/[0.06] active:scale-90";

export default function DinersCounter() {
    const { draft, errors, changeDiners } = useBookingFormContext();

    return (
        <div className="flex flex-col items-center justify-center border-t border-foreground-muted/15 pt-4 md:flex-1 md:border-t-0 md:pt-0 dark:border-foreground-muted/10">
            <label
                htmlFor="diners-value"
                className="mb-2 block text-sm/5 font-bold tracking-[0.05em] text-foreground"
            >
                Comensales
            </label>
            <div
                data-field="diners"
                className={`flex w-1/2 items-center justify-between overflow-hidden rounded-lg border border-border bg-background-alt md:w-auto ${errors.diners ? fieldErrorClasses : ""}`}
            >
                <Button
                    variant="ghost"
                    aria-label="Reducir comensales"
                    onClick={() => changeDiners(-1)}
                    className={btn}
                >
                    <Minus className="size-5" />
                </Button>
                <input
                    id="diners-value"
                    type="text"
                    value={draft.diners}
                    readOnly
                    className="w-12 appearance-none border-0 bg-transparent text-center text-2xl/8 font-semibold text-foreground outline-none"
                />
                <Button
                    variant="ghost"
                    aria-label="Aumentar comensales"
                    onClick={() => changeDiners(1)}
                    className={btn}
                >
                    <Add className="size-5" />
                </Button>
            </div>
            <FieldError field="diners" message={errors.diners} />
        </div>
    );
}

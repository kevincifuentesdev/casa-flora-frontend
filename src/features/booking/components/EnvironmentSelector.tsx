"use client";

import { Armchair, Home } from "reicon-react";

import { useBookingFormContext } from "../context/BookingFormContext";
import { ENVIRONMENTS } from "../domain/constants";
import type { EnvironmentId } from "../domain/types";
import { FieldError, fieldErrorClasses } from "./FieldError";

const icons: Record<EnvironmentId, typeof Home> = {
    interior: Armchair,
    patio: Home,
};

export default function EnvironmentSelector() {
    const { draft, errors, selectEnvironment } = useBookingFormContext();

    return (
        <fieldset className="m-0 border-0 p-0">
            <legend className="mb-3 block text-sm/5 font-bold tracking-[0.05em] text-foreground">
                Ambiente
            </legend>
            <div
                data-field="environment"
                className={`grid grid-cols-2 gap-4 ${errors.environment ? fieldErrorClasses : ""}`}
            >
                {ENVIRONMENTS.map(({ value, label }) => {
                    const Icon = icons[value];
                    return (
                        <label key={value} className="relative">
                            <input
                                type="radio"
                                name="environment"
                                value={value}
                                checked={draft.environment === value}
                                onChange={() => selectEnvironment(value)}
                                className="peer sr-only"
                            />
                            <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-border p-4 text-center shadow-[var(--shadow-ambient-sm)] transition-[border-color,background-color,box-shadow] duration-[250ms] hover:bg-background dark:hover:bg-background-alt peer-checked:border-primary peer-checked:bg-primary/[0.04] dark:peer-checked:bg-primary/[0.12] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-secondary">
                                <Icon className="size-7 shrink-0 text-primary" />
                                <span className="text-sm/5 font-bold tracking-[0.05em] text-foreground">
                                    {label}
                                </span>
                            </div>
                        </label>
                    );
                })}
            </div>
            <FieldError field="environment" message={errors.environment} />
        </fieldset>
    );
}

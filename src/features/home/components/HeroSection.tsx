"use client";

import Image from "next/image";
import Link from "next/link";
import { Bag2, Calendar } from "reicon-react";
import { useHome } from "../hooks/useHome";

const ctaClasses =
    "flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold transition duration-200";

export default function HeroSection() {
    const { hero } = useHome().content;

    return (
        <section className="flex flex-col items-center px-(--spacing-margin-mobile) py-12 text-center md:px-(--spacing-margin-desktop) md:py-20">
            <div className="relative mb-8 size-32 overflow-hidden rounded-full">
                <Image
                    src={hero.logoUrl}
                    alt="Logotipo de Casa Flora"
                    fill
                    sizes="8rem"
                    priority
                    className="object-cover"
                />
            </div>

            <h2 className="mb-6 max-w-3xl font-display text-3xl leading-tight text-primary md:text-5xl">
                {hero.title}
            </h2>

            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-foreground-muted">
                {hero.description}
            </p>

            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                <Link
                    href="/menu"
                    aria-label="Pedir domicilio"
                    className={`${ctaClasses} bg-secondary text-secondary-foreground shadow-md hover:scale-[1.02] sm:rounded-lg`}
                >
                    <Bag2 className="size-6 shrink-0" aria-hidden="true" />
                    Pedir domicilio
                </Link>
                <Link
                    href="/booking"
                    aria-label="Reservar una mesa"
                    className={`${ctaClasses} border border-accent text-accent hover:bg-accent/5 sm:rounded-lg`}
                >
                    <Calendar className="size-6 shrink-0" aria-hidden="true" />
                    Reservar una mesa
                </Link>
            </div>
        </section>
    );
}

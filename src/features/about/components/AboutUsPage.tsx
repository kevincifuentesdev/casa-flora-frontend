"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bag2, Calendar, Clock, Location } from "reicon-react";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const VALUES = [
    {
        title: "Respeto a la Tradición",
        description:
            "Rescatamos las recetas de nuestras abuelas, amasando el maíz a mano y sofriendo hogao a fuego lento como manda la memoria culinaria antioqueña.",
        tag: "Herencia",
    },
    {
        title: "Cosecha y Campo Local",
        description:
            "Nos abastecemos directamente con productores del oriente y suroeste de Antioquia, priorizando ingredientes frescos, sostenibles y de temporada.",
        tag: "Sostenibilidad",
    },
    {
        title: "Cocina Lenta y Paciente",
        description:
            "Creemos firmemente en el movimiento slow food: sin atajos industriales, caldos artificiales ni preservantes. Cada salsa se toma su tiempo justo.",
        tag: "Autenticidad",
    },
    {
        title: "Calidez de Hogar",
        description:
            "Queremos que al cruzar nuestras puertas o recibir tu pedido en casa sientas la misma hospitalidad con la que se recibe a un ser querido los domingos.",
        tag: "Hospitalidad",
    },
];

const LOCATIONS = [
    {
        name: "Sede El Poblado",
        environment: "Patio Interior Colonial",
        address: "Calle 10 # 36-24, El Poblado, Medellín",
        description:
            "Un espacio verde con luz natural, plantas nativas y mesas bajo el cielo antioqueño, perfecto para tardes de café, almuerzos reposados y sobremesas entre amigos.",
        hours: "Martes a Domingo: 12:00 PM a 10:00 PM",
    },
    {
        name: "Sede Laureles",
        environment: "Salón Principal Acogedor",
        address: "Circular 73B # 39B-12, Laureles, Medellín",
        description:
            "Ambiente íntimo con maderas cálidas, iluminación tenue y un entorno sereno para cenas familiares, celebraciones especiales o reuniones tranquilas.",
        hours: "Martes a Domingo: 12:00 PM a 10:00 PM",
    },
];

export default function AboutUsPage() {
    return (
        <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-8 pb-24 md:px-(--spacing-margin-desktop) md:py-16 md:pb-28">
            {/* Header Hero */}
            <section className="mx-auto max-w-3xl text-center">
                <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase dark:bg-primary/20 dark:text-primary-foreground">
                    Sobre Casa Flora
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl sm:leading-tight">
                    Tradición, Memoria y Sabor de Hogar
                </h1>
                <p className="mt-4 text-base leading-relaxed text-foreground-muted sm:text-lg">
                    Somos una cocina nacida en Medellín para quienes creen que
                    alimentarse bien es un placer, un acto de amor y una manera
                    de honrar las historias que nos unen alrededor de la mesa.
                </p>
            </section>

            {/* Story Grid */}
            <section className="mt-12 grid grid-cols-1 items-center gap-10 md:mt-16 md:grid-cols-2 lg:gap-14">
                <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold tracking-wider text-accent uppercase">
                        Nuestra Historia
                    </span>
                    <h2 className="mt-2 font-display text-2xl font-bold text-primary sm:text-3xl">
                        De la casa de la abuela a tu mesa
                    </h2>
                    <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-foreground sm:text-base">
                        <p className="m-0">
                            Casa Flora nació del anhelo de recuperar los domingos
                            familiares en las montañas de Antioquia: el sonido
                            del pilón de maíz al amanecer, el aroma a panela y
                            canela en el aire, y la mesa larga donde siempre
                            había un puesto extra para el visitante inesperado.
                        </p>
                        <p className="m-0 text-foreground-muted">
                            Frente a la prisa y la estandarización moderna,
                            decidimos construir un refugio gastronómico donde la
                            paciencia sea el condimento principal. Preparamos
                            nuestros guisos, empanadas, cazuelas y panes sin
                            atajos, respetando la sazón tradicional que alimentó
                            nuestra infancia.
                        </p>
                        <p className="m-0 text-foreground-muted">
                            Hoy compartimos esa herencia a través de nuestras
                            sedes en El Poblado y Laureles, así como en cada
                            pedido que llevamos a los hogares de todo el Valle de
                            Aburrá.
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            href="/menu"
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground no-underline shadow-(--shadow-ambient-sm) transition hover:opacity-90 ${focusRing}`}
                        >
                            <Bag2 className="size-4 shrink-0" aria-hidden="true" />
                            <span>Explorar Menú</span>
                        </Link>
                        <Link
                            href="/booking"
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/40 bg-surface px-6 py-2.5 text-xs font-bold text-primary no-underline transition hover:bg-background dark:border-foreground-muted/30 dark:text-foreground ${focusRing}`}
                        >
                            <Calendar className="size-4 shrink-0" aria-hidden="true" />
                            <span>Reservar Mesa</span>
                        </Link>
                    </div>
                </div>

                <div className="relative h-80 min-h-72 w-full overflow-hidden rounded-2xl border border-foreground-muted/15 shadow-(--shadow-ambient-md) sm:h-96 md:h-110">
                    <Image
                        src="/img/booking_hero.jpg"
                        alt="Espacio tradicional de Casa Flora"
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                    />
                </div>
            </section>

            {/* Values Section */}
            <section className="mt-16 border-t border-foreground-muted/15 pt-12 md:mt-24 md:pt-16">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="text-xs font-bold tracking-wider text-accent uppercase">
                        Nuestros Pilares
                    </span>
                    <h2 className="mt-2 font-display text-2xl font-bold text-primary sm:text-3xl">
                        Los valores que guían nuestra cocina
                    </h2>
                    <p className="mt-2 text-sm text-foreground-muted sm:text-base">
                        Cada plato servido en Casa Flora refleja un compromiso
                        ético con nuestra comunidad, el campo y la salud de
                        nuestros comensales.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {VALUES.map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col rounded-2xl border border-foreground-muted/15 bg-surface p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <span className="inline-block w-fit rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-bold text-secondary">
                                {item.tag}
                            </span>
                            <h3 className="mt-3 font-display text-lg font-bold text-primary">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Locations Section */}
            <section className="mt-16 border-t border-foreground-muted/15 pt-12 md:mt-24 md:pt-16">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="text-xs font-bold tracking-wider text-accent uppercase">
                        Nuestras Sedes
                    </span>
                    <h2 className="mt-2 font-display text-2xl font-bold text-primary sm:text-3xl">
                        Dos espacios pensados para el encuentro
                    </h2>
                    <p className="mt-2 text-sm text-foreground-muted sm:text-base">
                        Ubicados estratégicamente en Medellín para ofrecerte
                        ambientes cálidos, buena música y la mejor atención.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {LOCATIONS.map((loc) => (
                        <div
                            key={loc.name}
                            className="flex flex-col justify-between rounded-2xl border border-foreground-muted/15 bg-surface p-6 shadow-xs sm:p-8"
                        >
                            <div>
                                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-primary/25 dark:text-primary-foreground">
                                    {loc.environment}
                                </span>
                                <h3 className="mt-3 font-display text-xl font-bold text-primary sm:text-2xl">
                                    {loc.name}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-foreground-muted sm:text-sm">
                                    {loc.description}
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col gap-2 border-t border-foreground-muted/15 pt-4 text-xs text-foreground">
                                <div className="flex items-center gap-2">
                                    <Location className="size-4 shrink-0 text-accent" />
                                    <span>{loc.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="size-4 shrink-0 text-accent" />
                                    <span>{loc.hours}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action Banner */}
            <section className="mt-16 overflow-hidden rounded-3xl bg-primary p-8 text-center text-primary-foreground shadow-(--shadow-ambient-md) sm:p-12 md:mt-24">
                <div className="mx-auto max-w-2xl">
                    <h2 className="font-display text-2xl font-bold text-secondary sm:text-4xl">
                        ¿Listo para probar el verdadero sabor de casa?
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
                        Visítanos en nuestras sedes o pide a domicilio para
                        disfrutar de nuestras recetas tradicionales en la
                        comodidad de tu hogar.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/menu"
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-xs font-bold text-[#2b1d19] no-underline shadow-xs transition hover:bg-white ${focusRing}`}
                        >
                            <span>Ver la Carta</span>
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                        <Link
                            href="/booking"
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-xs font-bold text-white no-underline transition hover:bg-white/20 ${focusRing}`}
                        >
                            <span>Reservar tu Mesa</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

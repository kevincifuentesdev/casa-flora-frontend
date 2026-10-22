import Link from "next/link";
import { Call, Clock, Location, Sms } from "reicon-react";

interface FooterLink {
    label: string;
    href: string;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

const navigationSections: FooterSection[] = [
    {
        title: "Explorar",
        links: [
            { label: "Inicio", href: "/" },
            { label: "Menú de Temporada", href: "/menu" },
            { label: "Reservaciones", href: "/booking" },
            { label: "Sobre Nosotros", href: "/about-us" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Términos y Condiciones", href: "/terms-conditions" },
            { label: "Política de Privacidad", href: "/privacy-policy" },
            { label: "Preguntas Frecuentes", href: "/faq" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="relative mt-auto border-t border-border/20 bg-primary text-primary-foreground">
            {/* Subtle brand gold accent line */}
            <div
                className="h-1 w-full bg-gradient-to-r from-transparent via-secondary/70 to-transparent"
                aria-hidden="true"
            />

            <div className="mx-auto max-w-(--container-max) px-(--spacing-margin-mobile) pt-12 pb-28 md:px-(--spacing-margin-desktop) md:pt-16 md:pb-12">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
                        <div>
                            <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
                                Casa Flora
                            </h3>
                        </div>

                        <p className="max-w-sm font-body text-sm leading-relaxed text-white/80">
                            Tradición que Alimenta el Alma. Cocina con historia,
                            ingredientes frescos de nuestra tierra y el amor de
                            casa en cada plato.
                        </p>

                        <p className="font-body text-xs text-white/60">
                            Medellín, Antioquia, Colombia
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    {navigationSections.map((section) => (
                        <nav
                            key={section.title}
                            aria-label={`Enlaces de ${section.title}`}
                            className="flex flex-col gap-4"
                        >
                            <h4 className="font-body text-xs font-bold tracking-widest text-secondary uppercase">
                                {section.title}
                            </h4>

                            <ul className="flex flex-col gap-2 p-0 m-0 list-none">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="inline-flex min-h-[36px] items-center font-body text-sm text-white/80 transition-all duration-200 hover:translate-x-1 hover:text-secondary focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}

                    {/* Contact & Hours Column */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-body text-xs font-bold tracking-widest text-secondary uppercase">
                            Contacto & Horarios
                        </h4>

                        <address className="flex flex-col gap-3 font-body text-sm not-italic text-white/80">
                            <a
                                href="mailto:contacto@casaflora.co"
                                className="group inline-flex min-h-[36px] items-center gap-2.5 transition-colors duration-200 hover:text-secondary focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
                                aria-label="Enviar correo a contacto@casaflora.co"
                            >
                                <Sms
                                    className="size-4 shrink-0 text-secondary transition-transform duration-200 group-hover:scale-110"
                                    aria-hidden="true"
                                />
                                <span>contacto@casaflora.co</span>
                            </a>

                            <a
                                href="tel:+573001234567"
                                className="group inline-flex min-h-[36px] items-center gap-2.5 transition-colors duration-200 hover:text-secondary focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
                                aria-label="Llamar al +57 (300) 123-4567"
                            >
                                <Call
                                    className="size-4 shrink-0 text-secondary transition-transform duration-200 group-hover:scale-110"
                                    aria-hidden="true"
                                />
                                <span>+57 (300) 123-4567</span>
                            </a>

                            <div className="flex items-start gap-2.5 pt-1 text-xs text-white/70">
                                <Location
                                    className="mt-0.5 size-4 shrink-0 text-secondary"
                                    aria-hidden="true"
                                />
                                <span>El Poblado & Laureles, Medellín</span>
                            </div>

                            <div className="flex items-start gap-2.5 text-xs text-white/70">
                                <Clock
                                    className="mt-0.5 size-4 shrink-0 text-secondary"
                                    aria-hidden="true"
                                />
                                <span>Mar – Dom: 12:00 PM – 10:00 PM</span>
                            </div>
                        </address>
                    </div>
                </div>

                {/* Subfooter Divider & Legal Info */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-xs text-white/60 sm:flex-row sm:text-left">
                    <p className="m-0">
                        © {new Date().getFullYear()} Casa Flora. Todos los
                        derechos reservados.
                    </p>

                    <p className="m-0 font-medium text-white/75">
                        Tradición culinaria hecha con amor en Medellín
                    </p>
                </div>
            </div>
        </footer>
    );
}

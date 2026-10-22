import Link from "next/link";

const footerLinks = [
    {
        title: "Enlaces",
        links: [
            { label: "Sobre Nosotros", href: "/about-us" },
            { label: "Menú de Temporada", href: "/menu" },
            { label: "Reservaciones", href: "/booking" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Términos y Condiciones", href: "/terms-conditions" },
            { label: "Política de Privacidad", href: "/privacy-policy" },
        ],
    },
    {
        title: "Contacto",
        links: [
            { label: "Soporte", href: "/support" },
            {
                label: "contacto@casaflora.co",
                href: "mailto:contacto@casaflora.co",
            },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground pt-12 px-(--spacing-margin-mobile) pb-30 mt-auto md:px-(--spacing-margin-desktop) md:pb-12">
            <div className="grid grid-cols-1 gap-(--spacing-gutter) max-w-(--container-max) my-0 mx-auto">
                <div>
                    <h3 className="font-display text-2xl/loose text-secondary mt-0 mb-4">
                        Casa Flora
                    </h3>
                    <p className="font-body text-[1rem] text-[#ffffffcc] m-0">
                        Tradición que Alimenta el Alma. Sabores de casa, directo
                        a tu mesa.
                    </p>
                </div>

                <div>
                    {footerLinks.map((section) => (
                        <section key={section.title}>
                            <h4 className="font-body text-2xl/loose text-secondary uppercase ">{section.title}</h4>

                            <ul>
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
            <div className="footer-bottom">
                © 2026 Casa Flora - Tradición que Alimenta el Alma
            </div>
        </footer>
    );
}

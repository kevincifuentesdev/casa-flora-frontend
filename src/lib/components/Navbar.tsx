"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useState } from "react";


import { Moon, CartLarge5 } from "reicon-react";
import Button from "../ui/Button";

const navLinks = [
    { label: "Inicio", href: "/", icon: "home" },
    { label: "Menú", href: "/menu", icon: "menu" },
    { label: "Reserva", href: "/booking", icon: "booking" },
    { label: "Perfil", href: "/profile", icon: "profile" },
];

export default function Navbar() {
    const pathname = usePathname();

    const [darkTheme, setDarkTheme] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem("dark-theme") === "true";

        document.documentElement.classList.toggle("dark", storedTheme);

        startTransition(() => {
            setDarkTheme(storedTheme);
        })
    }, []);

    function toggleTheme() {
        const nextTheme = !darkTheme;

        setDarkTheme(nextTheme);
        localStorage.setItem("dark-theme", String(nextTheme));
        document.documentElement.classList.toggle("dark", nextTheme);
    }

    return (
        <header className="fixed top-0 z-50 w-full bg-[#f8f4ecf2] shadow-(--shadow-ambient-sm) backdrop-blur-md dark:bg-[#2c1e1af2]">
            <nav className="mx-auto flex h-16 max-w-(--container-max) items-center justify-between px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop)">
                <Button
                    variant="icon"
                    aria-label={
                        darkTheme ? "Activar modo claro" : "Activar modo oscuro"
                    }
                    aria-pressed={darkTheme}
                    onClick={toggleTheme}
                >
                    <Moon weight={darkTheme ? "Filled" : "Outline"} />
                </Button>

                <h1 className="font-display text-2xl/8 text-primary m-0 tracking-tight">
                    Casa Flora
                </h1>

                <div className="hidden items-center gap-6 md:flex">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={[
                                    "relative px-0 py-1.5",
                                    "font-body text-sm/5 tracking-wider text-foreground-muted no-underline",
                                    "transition-colors duration-300 ease-in-out",
                                    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5",
                                    "after:origin-center after:scale-x-0 after:bg-primary",
                                    "after:transition-transform after:duration-300 after:ease-in-out",
                                    "hover:text-primary hover:after:scale-x-100",
                                    isActive &&
                                        "font-bold text-primary after:scale-x-100",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <Button variant="icon" aria-label="Abrir carrito de compras">
                    <CartLarge5 />
                </Button>
            </nav>
        </header>
    );
}

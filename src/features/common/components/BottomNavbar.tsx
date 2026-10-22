"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "reicon-react";

import { useSession } from "@/features/auth/hooks/useSession";
import { navLinks } from "../services/navigation";

export default function BottomNavbar() {
    const pathname = usePathname();
    const { session, isLoading } = useSession();

    return (
        <nav
            aria-label="Navegación inferior móvil"
            className="fixed bottom-0 left-0 z-50 w-full bg-surface shadow-[0_-2px_10px_rgba(43,29,25,0.05)] md:hidden"
        >
            <div className="flex h-20 items-center justify-around px-3 py-0 pb-[env(safe-area-inset-bottom)]">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 no-underline text-foreground-muted transition duration-150 ease-in-out active:scale-95 ${
                                isActive
                                    ? "bg-[#ffddb84d] font-bold text-primary"
                                    : "hover:text-primary"
                            }`}
                        >
                            <Icon className="size-6 shrink-0" aria-hidden="true" />
                            <span className="mt-1 font-body text-[0.75rem]/4 font-semibold">
                                {link.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Dynamic Session Item for Mobile Bottom Bar */}
                {isLoading ? (
                    <div className="h-10 w-20" aria-hidden="true" />
                ) : session ? (
                    <Link
                        href="/profile"
                        className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 no-underline text-foreground-muted transition duration-150 ease-in-out active:scale-95 ${
                            pathname === "/profile"
                                ? "bg-[#ffddb84d] font-bold text-primary"
                                : "hover:text-primary"
                        }`}
                    >
                        <User className="size-6 shrink-0" aria-hidden="true" />
                        <span className="mt-1 font-body text-[0.75rem]/4 font-semibold">
                            Perfil
                        </span>
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 font-body text-xs font-bold text-primary-foreground shadow-[0_2px_8px_rgba(75,3,15,0.25)] transition duration-150 ease-in-out hover:opacity-90 active:scale-95"
                    >
                        <User className="size-4 shrink-0" aria-hidden="true" />
                        <span>Sé cliente</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}

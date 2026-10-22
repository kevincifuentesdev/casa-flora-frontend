"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "../services/navigation";

export default function BottomNavbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface shadow-[0_-2px_10px_rgba(43,29,25,0.05)] md:hidden">
            <div className="flex justify-around items-center h-20 py-0 px-4 pb-[env(safe-area-inset-bottom)]">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center no-underline text-foreground-muted py-1 px-3 rounded-xl transition duration-150 ease-in-out active:scale-95 ${isActive ? "text-primary font-bold bg-[#ffddb84d]" : ""}`}
                        >
                            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            <span className="font-body text-[0.75rem]/4 font-semibold mt-1">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

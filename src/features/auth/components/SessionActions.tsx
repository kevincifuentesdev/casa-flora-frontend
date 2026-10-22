"use client";

import Link from "next/link";
import { User } from "reicon-react";

import { useSession } from "../hooks/useSession";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

/**
 * Navbar slot for the user session:
 * - authenticated: profile icon link
 * - anonymous: "Sé cliente" call to action
 * - loading: reserved space (avoids flashing the wrong state on hydration)
 */
export default function SessionActions() {
    const { session, isLoading } = useSession();

    if (isLoading) {
        return <span aria-hidden="true" className="block size-9 md:size-10" />;
    }

    if (session) {
        return (
            <Link
                href="/profile"
                aria-label={`Perfil de ${session.user.name}`}
                title="Mi perfil"
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-primary transition duration-200 hover:opacity-80 active:scale-95 md:size-10 ${focusRing}`}
            >
                <User className="size-5 md:size-6" aria-hidden="true" />
            </Link>
        );
    }

    return (
        <Link
            href="/login"
            className={`inline-flex h-8.5 shrink-0 items-center justify-center rounded-md bg-primary px-3 font-body text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-xs transition duration-200 hover:opacity-90 active:scale-95 md:h-9 md:px-4 md:text-sm ${focusRing}`}
        >
            Sé cliente
        </Link>
    );
}

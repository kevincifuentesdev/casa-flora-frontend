"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type AdminSection = "orders" | "bookings" | "products";

interface AdminNavigationContextType {
    activeSection: AdminSection;
    setActiveSection: (section: AdminSection) => void;
    counts: {
        orders: number;
        bookings: number;
        products: number;
    };
    setCounts: (counts: {
        orders: number;
        bookings: number;
        products: number;
    }) => void;
}

const AdminNavigationContext =
    createContext<AdminNavigationContextType | null>(null);

export function AdminNavigationProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [activeSection, setActiveSectionState] = useState<AdminSection>(
        () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const sec = params.get("section");
                if (
                    sec === "orders" ||
                    sec === "bookings" ||
                    sec === "products"
                ) {
                    return sec;
                }
            }
            return "orders";
        },
    );
    const [counts, setCountsState] = useState({
        orders: 0,
        bookings: 0,
        products: 0,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const sec = params.get("section");
            if (sec === "orders" || sec === "bookings" || sec === "products") {
                setActiveSectionState(sec);
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const setActiveSection = useCallback((section: AdminSection) => {
        setActiveSectionState(section);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            if (url.pathname === "/admin") {
                url.searchParams.set("section", section);
                window.history.replaceState(null, "", url.toString());
            }
        }
    }, []);

    const setCounts = useCallback(
        (newCounts: {
            orders: number;
            bookings: number;
            products: number;
        }) => {
            setCountsState((prev) => {
                if (
                    prev.orders === newCounts.orders &&
                    prev.bookings === newCounts.bookings &&
                    prev.products === newCounts.products
                ) {
                    return prev;
                }
                return newCounts;
            });
        },
        [],
    );

    const value = useMemo(
        () => ({
            activeSection,
            setActiveSection,
            counts,
            setCounts,
        }),
        [activeSection, setActiveSection, counts, setCounts],
    );

    return (
        <AdminNavigationContext.Provider value={value}>
            {children}
        </AdminNavigationContext.Provider>
    );
}

export function useAdminNavigation() {
    const ctx = useContext(AdminNavigationContext);
    if (!ctx) {
        return {
            activeSection: "orders" as AdminSection,
            setActiveSection: () => {},
            counts: { orders: 0, bookings: 0, products: 0 },
            setCounts: () => {},
        };
    }
    return ctx;
}

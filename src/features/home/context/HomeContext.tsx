"use client";

import {
    createContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { fetchProducts } from "@/features/products/services/productService";
import type { HomeState } from "../domain/home";

const FEATURED_PRODUCTS_COUNT = 3;

export const HomeContext = createContext<HomeState | null>(null);

export function HomeProvider({
    value,
    children,
}: {
    value: HomeState;
    children: ReactNode;
}) {
    const [featuredProducts, setFeaturedProducts] = useState(
        value.featuredProducts,
    );

    useEffect(() => {
        let cancelled = false;

        fetchProducts()
            .then((response) => {
                if (!cancelled && response.data.length > 0) {
                    setFeaturedProducts(
                        response.data.slice(0, FEATURED_PRODUCTS_COUNT),
                    );
                }
            })
            .catch(() => {
                // Keep initial catalog snapshot if backend is temporarily unreachable.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const state = useMemo<HomeState>(
        () => ({
            content: value.content,
            featuredProducts,
        }),
        [value.content, featuredProducts],
    );

    return (
        <HomeContext.Provider value={state}>{children}</HomeContext.Provider>
    );
}

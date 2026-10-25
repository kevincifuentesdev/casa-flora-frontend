"use client";

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    DEFAULT_SORT,
    getMaxPrice,
    type MenuFilters,
    type SortOption,
} from "@/features/menu/domain/menuFilters";
import { getMenuProducts } from "@/features/menu/services/menuService";
import type { Product } from "@/features/products/domain/product";
import { fetchProducts } from "@/features/products/services/productService";

const SEARCH_DEBOUNCE_MS = 300;

export interface MenuFiltersContextValue {
    filters: MenuFilters;
    catalogProducts: Product[];
    searchInput: string;
    globalMaxPrice: number;
    panelOpen: boolean;
    isLoading: boolean;
    error: string | null;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    toggleCategory: (category: string) => void;
    setMaxPrice: (value: number) => void;
    resetMaxPrice: () => void;
    setSort: (value: SortOption) => void;
    clearAll: () => void;
    openPanel: () => void;
    closePanel: () => void;
    reloadCatalog: () => Promise<void>;
}

export const MenuFiltersContext = createContext<MenuFiltersContextValue | null>(
    null,
);

export function MenuFiltersProvider({ children }: { children: ReactNode }) {
    const initialCatalog = useMemo(() => getMenuProducts(), []);
    const [catalogProducts, setCatalogProducts] =
        useState<Product[]>(initialCatalog);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const globalMaxPrice = useMemo(
        () =>
            catalogProducts.length > 0 ? getMaxPrice(catalogProducts) : 25000,
        [catalogProducts],
    );

    const [searchInput, setSearchInputState] = useState("");
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState(globalMaxPrice);
    const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
    const [panelOpen, setPanelOpen] = useState(false);

    const reloadCatalog = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchProducts();
            setCatalogProducts(response.data);
            const nextMax =
                response.meta?.maxPrice ??
                (response.data.length > 0 ? getMaxPrice(response.data) : 25000);
            setMaxPrice((prev) =>
                prev === globalMaxPrice || prev > nextMax ? nextMax : prev,
            );
        } catch {
            setError(
                "No pudimos sincronizar el menú con el servidor. Mostrando catálogo local.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [globalMaxPrice]);

    useEffect(() => {
        void reloadCatalog();
    }, [reloadCatalog]);

    useEffect(() => {
        const timeout = setTimeout(
            () => setSearch(searchInput),
            SEARCH_DEBOUNCE_MS,
        );
        return () => clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", panelOpen);
        return () => document.body.classList.remove("overflow-hidden");
    }, [panelOpen]);

    const clearSearch = useCallback(() => {
        setSearchInputState("");
        setSearch("");
    }, []);

    const toggleCategory = useCallback((category: string) => {
        setCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category],
        );
    }, []);

    const resetMaxPrice = useCallback(
        () => setMaxPrice(globalMaxPrice),
        [globalMaxPrice],
    );

    const clearAll = useCallback(() => {
        setCategories([]);
        clearSearch();
        setSort(DEFAULT_SORT);
        setMaxPrice(globalMaxPrice);
    }, [clearSearch, globalMaxPrice]);

    const openPanel = useCallback(() => setPanelOpen(true), []);
    const closePanel = useCallback(() => setPanelOpen(false), []);

    const value = useMemo<MenuFiltersContextValue>(
        () => ({
            filters: { search, categories, maxPrice, sort },
            catalogProducts,
            searchInput,
            globalMaxPrice,
            panelOpen,
            isLoading,
            error,
            setSearchInput: setSearchInputState,
            clearSearch,
            toggleCategory,
            setMaxPrice,
            resetMaxPrice,
            setSort,
            clearAll,
            openPanel,
            closePanel,
            reloadCatalog,
        }),
        [
            search,
            categories,
            maxPrice,
            sort,
            catalogProducts,
            searchInput,
            globalMaxPrice,
            panelOpen,
            isLoading,
            error,
            clearSearch,
            toggleCategory,
            resetMaxPrice,
            clearAll,
            openPanel,
            closePanel,
            reloadCatalog,
        ],
    );

    return (
        <MenuFiltersContext.Provider value={value}>
            {children}
        </MenuFiltersContext.Provider>
    );
}

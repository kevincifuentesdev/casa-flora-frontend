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
    type MenuFilters,
    type SortOption,
} from "@/features/menu/domain/menuFilters";
import { getMenuMaxPrice } from "@/features/menu/services/menuService";

const SEARCH_DEBOUNCE_MS = 300;

export interface MenuFiltersContextValue {
    /** Applied (debounced) filters. */
    filters: MenuFilters;
    /** Raw text currently typed in the search input. */
    searchInput: string;
    globalMaxPrice: number;
    panelOpen: boolean;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    toggleCategory: (category: string) => void;
    setMaxPrice: (value: number) => void;
    resetMaxPrice: () => void;
    setSort: (value: SortOption) => void;
    clearAll: () => void;
    openPanel: () => void;
    closePanel: () => void;
}

export const MenuFiltersContext = createContext<MenuFiltersContextValue | null>(
    null,
);

export function MenuFiltersProvider({ children }: { children: ReactNode }) {
    const globalMaxPrice = useMemo(() => getMenuMaxPrice(), []);

    const [searchInput, setSearchInputState] = useState("");
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState(globalMaxPrice);
    const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
    const [panelOpen, setPanelOpen] = useState(false);

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
            searchInput,
            globalMaxPrice,
            panelOpen,
            setSearchInput: setSearchInputState,
            clearSearch,
            toggleCategory,
            setMaxPrice,
            resetMaxPrice,
            setSort,
            clearAll,
            openPanel,
            closePanel,
        }),
        [
            search,
            categories,
            maxPrice,
            sort,
            searchInput,
            globalMaxPrice,
            panelOpen,
            clearSearch,
            toggleCategory,
            resetMaxPrice,
            clearAll,
            openPanel,
            closePanel,
        ],
    );

    return (
        <MenuFiltersContext.Provider value={value}>
            {children}
        </MenuFiltersContext.Provider>
    );
}

"use client";

import { useContext } from "react";

import {
    MenuFiltersContext,
    type MenuFiltersContextValue,
} from "@/features/menu/context/MenuFiltersContext";

export function useMenuFilters(): MenuFiltersContextValue {
    const context = useContext(MenuFiltersContext);
    if (!context) {
        throw new Error("useMenuFilters must be used within MenuFiltersProvider");
    }
    return context;
}

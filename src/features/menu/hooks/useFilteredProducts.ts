"use client";

import { useMemo } from "react";

import { filterProducts } from "@/features/menu/domain/menuFilters";
import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";

export function useFilteredProducts() {
    const { filters, catalogProducts, isLoading, error, reloadCatalog } =
        useMenuFilters();
    const filtered = useMemo(
        () => filterProducts(catalogProducts, filters),
        [catalogProducts, filters],
    );

    return {
        products: filtered,
        total: catalogProducts.length,
        isLoading,
        error,
        reloadCatalog,
    };
}

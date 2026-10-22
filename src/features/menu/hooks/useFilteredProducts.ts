"use client";

import { useMemo } from "react";

import { filterProducts } from "@/features/menu/domain/menuFilters";
import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";
import { getMenuProducts } from "@/features/menu/services/menuService";

export function useFilteredProducts() {
    const { filters } = useMenuFilters();
    const products = useMemo(() => getMenuProducts(), []);
    const filtered = useMemo(
        () => filterProducts(products, filters),
        [products, filters],
    );

    return { products: filtered, total: products.length };
}

import type { Product } from "@/features/products/domain/product";

export type SortOption = "relevancia" | "precio-asc" | "precio-desc" | "nombre-az";

export interface MenuFilters {
    search: string;
    categories: string[];
    maxPrice: number;
    sort: SortOption;
}

export interface SortChoice {
    value: SortOption;
    label: string;
}

export const DEFAULT_SORT: SortOption = "relevancia";

export const sortChoices: SortChoice[] = [
    { value: "relevancia", label: "Relevancia" },
    { value: "precio-asc", label: "Precio: menor a mayor" },
    { value: "precio-desc", label: "Precio: mayor a menor" },
    { value: "nombre-az", label: "Nombre A–Z" },
];

export function getMaxPrice(products: Product[]): number {
    return Math.max(...products.map((p) => p.price));
}

export function getAllCategories(products: Product[]): string[] {
    const set = new Set<string>();
    products.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return Array.from(set);
}

export function filterProducts(
    products: Product[],
    filters: MenuFilters,
): Product[] {
    let filtered = [...products];

    if (filters.categories.length > 0) {
        filtered = filtered.filter((p) =>
            p.categories.some((c) => filters.categories.includes(c)),
        );
    }

    filtered = filtered.filter((p) => p.price <= filters.maxPrice);

    const query = filters.search.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query),
        );
    }

    switch (filters.sort) {
        case "precio-asc":
            filtered.sort((a, b) => a.price - b.price);
            break;
        case "precio-desc":
            filtered.sort((a, b) => b.price - a.price);
            break;
        case "nombre-az":
            filtered.sort((a, b) => a.name.localeCompare(b.name, "es"));
            break;
        default:
            break;
    }

    return filtered;
}

export function hasActiveFilters(
    filters: MenuFilters,
    globalMax: number,
): boolean {
    return (
        filters.categories.length > 0 ||
        filters.maxPrice < globalMax ||
        filters.search.trim() !== "" ||
        filters.sort !== DEFAULT_SORT
    );
}

/** Number shown in the mobile filter toggle badge (sort is not counted). */
export function countActiveFilters(
    filters: MenuFilters,
    globalMax: number,
): number {
    let count = filters.categories.length;
    if (filters.maxPrice < globalMax) count++;
    if (filters.search.trim()) count++;
    return count;
}

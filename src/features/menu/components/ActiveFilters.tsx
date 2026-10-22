"use client";

import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";
import { formatPrice } from "@/features/products/domain/product";

function FilterTag({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex animate-tag-in items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary-foreground">
            {label}
            <button
                type="button"
                aria-label={`Quitar filtro: ${label}`}
                onClick={onRemove}
                className="flex cursor-pointer items-center justify-center border-none bg-none p-0 text-sm leading-none opacity-60 transition-opacity hover:opacity-100"
            >
                ✕
            </button>
        </span>
    );
}

export default function ActiveFilters() {
    const {
        filters,
        globalMaxPrice,
        toggleCategory,
        resetMaxPrice,
        clearSearch,
    } = useMenuFilters();

    const query = filters.search.trim();
    const hasPrice = filters.maxPrice < globalMaxPrice;

    if (filters.categories.length === 0 && !hasPrice && !query) return null;

    return (
        <div id="active-filters" className="mb-4 flex flex-wrap gap-2">
            {filters.categories.map((cat) => (
                <FilterTag
                    key={cat}
                    label={cat}
                    onRemove={() => toggleCategory(cat)}
                />
            ))}
            {hasPrice && (
                <FilterTag
                    label={`Hasta ${formatPrice(filters.maxPrice)}`}
                    onRemove={resetMaxPrice}
                />
            )}
            {query && (
                <FilterTag label={`"${query}"`} onRemove={clearSearch} />
            )}
        </div>
    );
}

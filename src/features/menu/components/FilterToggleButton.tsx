"use client";

import { Filter3 } from "reicon-react";

import { countActiveFilters } from "@/features/menu/domain/menuFilters";
import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";

export default function FilterToggleButton() {
    const { filters, globalMaxPrice, openPanel } = useMenuFilters();
    const count = countActiveFilters(filters, globalMaxPrice);

    return (
        <button
            type="button"
            id="filter-toggle-btn"
            aria-label="Abrir filtros"
            onClick={openPanel}
            className="mb-4 flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground transition active:scale-[0.97] md:hidden"
        >
            <Filter3
                width={18}
                height={18}
                aria-hidden="true"
                className="size-4.5 shrink-0 text-secondary"
            />
            Filtros
            {count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs leading-none font-bold text-primary-foreground">
                    {count}
                </span>
            )}
        </button>
    );
}

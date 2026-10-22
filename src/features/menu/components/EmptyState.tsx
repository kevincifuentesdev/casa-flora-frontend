"use client";

import { SearchNormal2 } from "reicon-react";

import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";

export default function EmptyState() {
    const { clearAll } = useMenuFilters();

    return (
        <div
            id="empty-state"
            className="flex animate-card-in flex-col items-center justify-center px-8 py-16 text-center"
        >
            <SearchNormal2
                width={64}
                height={64}
                aria-hidden="true"
                className="mb-6 size-16 text-foreground-muted opacity-40"
            />
            <h3 className="m-0 mb-2 font-display text-2xl leading-8 text-primary">
                Sin resultados
            </h3>
            <p className="m-0 mb-6 max-w-sm text-base text-foreground-muted">
                No encontramos productos que coincidan con tus filtros. Intenta
                ajustar tu búsqueda.
            </p>
            <button
                type="button"
                id="empty-state-btn"
                onClick={clearAll}
                className="cursor-pointer rounded-full border-none bg-secondary px-6 py-2.5 text-sm font-bold text-secondary-foreground transition hover:scale-[1.03]"
            >
                Ver todo el menú
            </button>
        </div>
    );
}

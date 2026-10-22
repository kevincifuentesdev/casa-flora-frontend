"use client";

import { SearchNormal2 } from "reicon-react";

import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";

export default function MenuSearchBar() {
    const { searchInput, setSearchInput } = useMenuFilters();

    return (
        <section className="mx-auto mb-6 max-w-(--container-max) px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop)">
            <div className="relative w-full">
                <SearchNormal2
                    width={20}
                    height={20}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-foreground-muted"
                />
                <input
                    type="text"
                    id="search-input"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por nombre o descripción..."
                    autoComplete="off"
                    className="w-full rounded-full border border-border bg-surface py-3.5 pr-4 pl-12 text-base leading-6 text-foreground outline-none transition placeholder:text-foreground-muted focus:border-primary focus:shadow-[0_0_0_3px_rgb(75_3_15/8%)] dark:focus:shadow-[0_0_0_3px_rgb(138_31_45/20%)]"
                />
            </div>
        </section>
    );
}

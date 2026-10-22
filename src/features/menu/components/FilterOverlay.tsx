"use client";

import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";

export default function FilterOverlay() {
    const { panelOpen, closePanel } = useMenuFilters();

    return (
        <div
            id="filter-overlay"
            onClick={closePanel}
            className={`fixed inset-0 z-90 bg-[rgb(38_24_20/50%)] transition-opacity duration-300 md:hidden ${
                panelOpen ? "block opacity-100" : "hidden opacity-0"
            }`}
        />
    );
}

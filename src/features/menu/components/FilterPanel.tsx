"use client";

import { getMenuCategories } from "@/features/menu/services/menuService";
import {
    hasActiveFilters,
    sortChoices,
    type SortOption,
} from "@/features/menu/domain/menuFilters";
import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";
import { formatPrice } from "@/features/products/domain/product";

const categories = getMenuCategories();

const chevronIcon =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23887272' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")";

const dividerClass = "m-0 border-0 border-t border-border opacity-30";
const groupTitleClass =
    "m-0 text-sm leading-5 font-bold tracking-[0.05em] text-foreground uppercase";

const sliderClass =
    "h-1 w-full cursor-pointer appearance-none rounded-full bg-border outline-none transition " +
    "[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgb(38_24_20/20%)] [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-115 hover:[&::-webkit-slider-thumb]:shadow-[0_3px_10px_rgb(38_24_20/30%)] " +
    "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-secondary [&::-moz-range-thumb]:shadow-[0_2px_6px_rgb(38_24_20/20%)]";

export default function FilterPanel() {
    const {
        filters,
        globalMaxPrice,
        panelOpen,
        closePanel,
        toggleCategory,
        setMaxPrice,
        setSort,
        clearAll,
    } = useMenuFilters();

    return (
        <aside
            id="filter-panel"
            aria-label="Panel de filtros"
            className={`custom-scrollbar fixed top-0 left-0 z-100 flex h-full w-[85%] max-w-80 flex-col gap-6 overflow-y-auto overscroll-contain bg-surface p-6 shadow-[4px_0_24px_rgb(38_24_20/12%)] transition-[transform,background-color] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] md:sticky md:top-20 md:z-auto md:h-fit md:max-h-[calc(100vh-6rem)] md:w-65 md:min-w-65 md:max-w-none md:translate-x-0 md:rounded-lg md:shadow-(--shadow-ambient-sm) lg:w-70 lg:min-w-70 ${
                panelOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="flex items-center justify-between">
                <h3 className="m-0 font-display text-2xl leading-8 text-primary">
                    Filtros
                </h3>
                <button
                    type="button"
                    id="filter-close-btn"
                    aria-label="Cerrar filtros"
                    onClick={closePanel}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-xl text-foreground-muted transition hover:bg-[rgb(38_24_20/6%)] hover:text-foreground md:hidden"
                >
                    ✕
                </button>
            </div>

            <hr className={dividerClass} />

            <div className="flex flex-col gap-3">
                <h4 className={groupTitleClass}>Categoría</h4>
                <div id="category-pills" className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                        const active = filters.categories.includes(cat);
                        return (
                            <button
                                key={cat}
                                type="button"
                                data-category={cat}
                                aria-pressed={active}
                                onClick={() => toggleCategory(cat)}
                                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs whitespace-nowrap transition hover:border-primary hover:text-primary ${
                                    active
                                        ? "border-primary bg-primary/12 font-bold text-primary dark:bg-primary/25 dark:text-primary-foreground"
                                        : "border-border bg-transparent font-semibold text-foreground"
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            <hr className={dividerClass} />

            <div className="flex flex-col gap-3">
                <h4 className={groupTitleClass}>Rango de precio</h4>
                <div className="flex flex-col gap-2">
                    <input
                        type="range"
                        id="price-slider"
                        min={0}
                        max={globalMaxPrice}
                        step={1000}
                        value={filters.maxPrice}
                        onChange={(e) =>
                            setMaxPrice(parseInt(e.target.value, 10))
                        }
                        className={sliderClass}
                    />
                    <div className="flex justify-between text-xs text-foreground-muted">
                        <span>$0</span>
                        <span>
                            Hasta{" "}
                            <strong
                                id="price-current"
                                className="font-bold text-secondary"
                            >
                                {formatPrice(filters.maxPrice)}
                            </strong>
                        </span>
                        <span id="price-max">{formatPrice(globalMaxPrice)}</span>
                    </div>
                </div>
            </div>

            <hr className={dividerClass} />

            <div className="flex flex-col gap-3">
                <h4 className={groupTitleClass}>Ordenar por</h4>
                <select
                    id="sort-select"
                    value={filters.sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    style={{ backgroundImage: chevronIcon }}
                    className="w-full cursor-pointer appearance-none rounded-(--radius-default) border border-border bg-surface bg-size-[1rem] bg-position-[right_0.75rem_center] bg-no-repeat py-2.5 pr-10 pl-3.5 text-base text-foreground outline-none transition focus:border-primary"
                >
                    {sortChoices.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                            {choice.label}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                id="clear-filters-btn"
                disabled={!hasActiveFilters(filters, globalMaxPrice)}
                onClick={clearAll}
                className="mt-auto cursor-pointer rounded-(--radius-default) border border-accent bg-transparent px-4 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/8 disabled:cursor-not-allowed disabled:opacity-40"
            >
                Limpiar filtros
            </button>
        </aside>
    );
}

"use client";

import ActiveFilters from "@/features/menu/components/ActiveFilters";
import EmptyState from "@/features/menu/components/EmptyState";
import ProductCard from "@/features/menu/components/ProductCard";
import { useFilteredProducts } from "@/features/menu/hooks/useFilteredProducts";

export default function ProductGrid() {
    const { products, total, isLoading, error, reloadCatalog } =
        useFilteredProducts();

    return (
        <div className="w-full md:min-w-0 md:flex-1">
            <ActiveFilters />

            {error && (
                <div
                    role="status"
                    className="mb-4 flex flex-col items-start justify-between gap-3 rounded-lg border border-secondary/40 bg-background-alt px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => void reloadCatalog()}
                        className="min-h-11 shrink-0 cursor-pointer rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95"
                    >
                        Reintentar conexión
                    </button>
                </div>
            )}

            <div className="mb-4 flex items-center justify-between gap-2">
                <p
                    id="results-count"
                    className="m-0 text-sm text-foreground-muted"
                >
                    Mostrando {products.length} de {total} productos
                </p>
                {isLoading && (
                    <span
                        role="status"
                        aria-live="polite"
                        className="text-xs font-semibold text-secondary"
                    >
                        Actualizando menú...
                    </span>
                )}
            </div>

            {products.length === 0 ? (
                <EmptyState />
            ) : (
                <div
                    id="products-grid"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {products.map((product, i) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={i}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

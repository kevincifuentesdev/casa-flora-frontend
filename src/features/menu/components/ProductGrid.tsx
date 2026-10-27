"use client";

import { useMemo, useState } from "react";
import { AngleLeft, AngleRight } from "reicon-react";

import ActiveFilters from "@/features/menu/components/ActiveFilters";
import EmptyState from "@/features/menu/components/EmptyState";
import ProductCard from "@/features/menu/components/ProductCard";
import ProductDetailModal from "@/features/menu/components/ProductDetailModal";
import { useFilteredProducts } from "@/features/menu/hooks/useFilteredProducts";
import type { Product } from "@/features/products/domain/product";

const ITEMS_PER_PAGE = 6;
const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export default function ProductGrid() {
    const { products, total, isLoading, error, reloadCatalog } =
        useFilteredProducts();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedProducts = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [products, safeCurrentPage]);

    const startDisplay =
        products.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
    const endDisplay = Math.min(safeCurrentPage * ITEMS_PER_PAGE, products.length);

    const pages = useMemo(() => {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (typeof window !== "undefined") {
            const gridEl = document.getElementById("products-grid");
            if (gridEl) {
                gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

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
                    Mostrando {startDisplay} - {endDisplay} de {products.length} productos
                    {products.length !== total && ` (${total} en total)`}
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
                <>
                    <div
                        id="products-grid"
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {paginatedProducts.map((product, i) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={(safeCurrentPage - 1) * ITEMS_PER_PAGE + i}
                                onSelectProduct={setSelectedProduct}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <nav
                            aria-label="Paginación de productos del menú"
                            className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-foreground-muted/15 pt-6 sm:flex-row"
                        >
                            <p className="m-0 text-xs text-foreground-muted">
                                Página {safeCurrentPage} de {totalPages}
                            </p>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={safeCurrentPage <= 1}
                                    onClick={() =>
                                        handlePageChange(
                                            Math.max(1, safeCurrentPage - 1),
                                        )
                                    }
                                    aria-label="Página anterior"
                                    className={`inline-flex min-h-9 items-center gap-1 rounded-full border border-foreground-muted/20 bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                                >
                                    <AngleLeft
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    <span>Anterior</span>
                                </button>

                                <div className="flex items-center gap-1">
                                    {pages.map((page) => {
                                        const isCurrent =
                                            page === safeCurrentPage;
                                        return (
                                            <button
                                                key={page}
                                                type="button"
                                                aria-current={
                                                    isCurrent
                                                        ? "page"
                                                        : undefined
                                                }
                                                aria-label={`Ir a la página ${page}`}
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition ${
                                                    isCurrent
                                                        ? "bg-primary text-primary-foreground shadow-xs"
                                                        : "border border-foreground-muted/20 bg-surface text-foreground hover:bg-background-alt"
                                                } ${focusRing}`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    disabled={safeCurrentPage >= totalPages}
                                    onClick={() =>
                                        handlePageChange(
                                            Math.min(
                                                totalPages,
                                                safeCurrentPage + 1,
                                            ),
                                        )
                                    }
                                    aria-label="Página siguiente"
                                    className={`inline-flex min-h-9 items-center gap-1 rounded-full border border-foreground-muted/20 bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                                >
                                    <span>Siguiente</span>
                                    <AngleRight
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        </nav>
                    )}
                </>
            )}

            {selectedProduct && (
                <ProductDetailModal
                    key={selectedProduct.id}
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}

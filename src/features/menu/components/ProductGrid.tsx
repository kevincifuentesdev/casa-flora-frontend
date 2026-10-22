"use client";

import { useFilteredProducts } from "@/features/menu/hooks/useFilteredProducts";
import ActiveFilters from "@/features/menu/components/ActiveFilters";
import EmptyState from "@/features/menu/components/EmptyState";
import ProductCard from "@/features/menu/components/ProductCard";

export default function ProductGrid() {
    const { products, total } = useFilteredProducts();

    return (
        <div className="w-full md:min-w-0 md:flex-1">
            <ActiveFilters />

            <p
                id="results-count"
                className="mt-0 mb-4 text-sm text-foreground-muted"
            >
                Mostrando {products.length} de {total} productos
            </p>

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

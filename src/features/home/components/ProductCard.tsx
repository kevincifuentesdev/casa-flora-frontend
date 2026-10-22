import Image from "next/image";
import { CartLarge5 } from "reicon-react";
import Button from "@/features/common/components/Button";
import type { Product } from "@/features/products/domain/product";
import { formatPrice } from "@/features/products/domain/product";

export default function ProductCard({ product }: { product: Product }) {
    return (
        <article className="group flex cursor-pointer flex-col overflow-hidden rounded-lg bg-surface shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                />
                {product.categories[0] && (
                    <div className="absolute top-4 left-4 z-10 rounded-full bg-background/85 px-3 py-1 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-accent">
                            {product.categories[0]}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex grow flex-col p-6">
                <h3 className="mb-2 font-display text-2xl text-primary">
                    {product.name}
                </h3>
                <p className="mb-6 line-clamp-2 text-foreground-muted">
                    {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-secondary">
                        {formatPrice(product.price)}
                    </span>
                    <Button
                        variant="icon"
                        aria-label={`Agregar ${product.name} al carrito`}
                    >
                        <CartLarge5 aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </article>
    );
}

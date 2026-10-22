import Image from "next/image";
import { CartAdd } from "reicon-react";

import { formatPrice, type Product } from "@/features/products/domain/product";

export default function ProductCard({
    product,
    index,
}: {
    product: Product;
    index: number;
}) {
    return (
        <div
            className="group flex animate-card-in cursor-pointer flex-col overflow-hidden rounded-lg bg-surface shadow-[0_8px_24px_rgb(38_24_20/6%)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgb(38_24_20/12%)]"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5">
                    {product.categories.map((cat) => (
                        <span
                            key={cat}
                            className="rounded-full bg-[rgb(255_248_246/85%)] px-3 py-1 text-xs font-semibold text-accent backdrop-blur-xs dark:bg-[rgb(44_30_26/85%)]"
                        >
                            {cat}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex grow flex-col p-6">
                <h3 className="mt-0 mb-2 font-display text-2xl leading-8 text-primary">
                    {product.name}
                </h3>
                <p className="mt-0 mb-6 line-clamp-2 text-base leading-6 text-foreground-muted">
                    {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm font-bold text-secondary">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        type="button"
                        aria-label="Agregar al carrito"
                        className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary transition hover:opacity-70"
                    >
                        <CartAdd
                            width={24}
                            height={24}
                            aria-hidden="true"
                            className="size-6 text-inherit"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

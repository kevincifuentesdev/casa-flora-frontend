"use client";

import Image from "next/image";
import Link from "next/link";
import { CartAdd } from "reicon-react";

import { useSession } from "@/features/auth/hooks/useSession";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatPrice, type Product } from "@/features/products/domain/product";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export default function ProductCard({
    product,
    index,
    onSelectProduct,
}: {
    product: Product;
    index: number;
    onSelectProduct?: (product: Product) => void;
}) {
    const { session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const { addItem, decrementItem, getItemQuantity, openCart } = useCart();
    const quantityInCart = getItemQuantity(product.id);

    return (
        <div
            role={onSelectProduct ? "button" : undefined}
            tabIndex={onSelectProduct ? 0 : undefined}
            aria-label={
                onSelectProduct
                    ? `Ver detalles de ${product.name}`
                    : undefined
            }
            onClick={() => onSelectProduct?.(product)}
            onKeyDown={(e) => {
                if (onSelectProduct && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelectProduct(product);
                }
            }}
            className={`group flex animate-card-in flex-col overflow-hidden rounded-lg bg-surface shadow-[0_8px_24px_rgb(38_24_20/6%)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgb(38_24_20/12%)] ${
                onSelectProduct
                    ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                    : ""
            }`}
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
                <h3 className="mt-0 mb-2 font-display text-2xl leading-8 text-primary transition group-hover:text-secondary">
                    {product.name}
                </h3>
                <p className="mt-0 mb-6 line-clamp-2 text-base leading-6 text-foreground-muted">
                    {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-secondary">
                        {formatPrice(product.price)}
                    </span>

                    {isAdmin ? (
                        <Link
                            href="/admin"
                            className="inline-flex items-center rounded-full bg-surface-alt px-3 py-1.5 font-body text-xs font-semibold text-primary no-underline transition hover:bg-primary hover:text-primary-foreground"
                        >
                            Gestionar producto
                        </Link>
                    ) : quantityInCart > 0 ? (
                        <div className="flex items-center gap-1.5">
                            <div
                                role="group"
                                aria-label={`Cantidad de ${product.name} en tu bolsa`}
                                className="inline-flex items-center rounded-full border border-primary/25 bg-background p-0.5"
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        decrementItem(product.id);
                                    }}
                                    aria-label={
                                        quantityInCart === 1
                                            ? `Quitar ${product.name} de la bolsa`
                                            : `Disminuir cantidad de ${product.name}`
                                    }
                                    className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-sm font-bold text-primary transition hover:bg-primary/10 active:scale-95 ${focusRing}`}
                                >
                                    -
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openCart();
                                    }}
                                    aria-label={`Ver ${quantityInCart} en tu bolsa`}
                                    className={`inline-flex min-h-11 min-w-8 cursor-pointer items-center justify-center border-none bg-transparent px-1.5 text-xs font-bold text-primary ${focusRing}`}
                                >
                                    {quantityInCart}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addItem(product, 1);
                                    }}
                                    aria-label={`Agregar otra unidad de ${product.name}`}
                                    className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-sm font-bold text-primary transition hover:bg-primary/10 active:scale-95 ${focusRing}`}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                addItem(product, 1);
                            }}
                            aria-label={`Agregar ${product.name} al carrito`}
                            title="Agregar al carrito"
                            className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-2 text-primary transition hover:bg-primary/8 active:scale-95 ${focusRing}`}
                        >
                            <CartAdd
                                width={24}
                                height={24}
                                aria-hidden="true"
                                className="size-6 text-inherit"
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

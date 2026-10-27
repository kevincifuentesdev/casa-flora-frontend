"use client";

import Image from "next/image";
import Link from "next/link";
import { CartLarge5 } from "reicon-react";

import { useSession } from "@/features/auth/hooks/useSession";
import { useCart } from "@/features/cart/hooks/useCart";
import Button from "@/features/common/components/Button";
import type { Product } from "@/features/products/domain/product";
import { formatPrice } from "@/features/products/domain/product";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export default function ProductCard({ product }: { product: Product }) {
    const { session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const { addItem, decrementItem, getItemQuantity, openCart } = useCart();
    const quantityInCart = getItemQuantity(product.id);

    return (
        <article className="group flex flex-col overflow-hidden rounded-lg bg-surface shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
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
                <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-secondary">
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
                        <div
                            role="group"
                            aria-label={`Cantidad de ${product.name} en tu bolsa`}
                            className="inline-flex items-center rounded-full border border-primary/25 bg-background p-0.5"
                        >
                            <button
                                type="button"
                                onClick={() => decrementItem(product.id)}
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
                                onClick={openCart}
                                aria-label={`Ver ${quantityInCart} en tu bolsa`}
                                className={`inline-flex min-h-11 min-w-8 cursor-pointer items-center justify-center border-none bg-transparent px-1.5 text-xs font-bold text-primary ${focusRing}`}
                            >
                                {quantityInCart}
                            </button>
                            <button
                                type="button"
                                onClick={() => addItem(product, 1)}
                                aria-label={`Agregar otra unidad de ${product.name}`}
                                className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-sm font-bold text-primary transition hover:bg-primary/10 active:scale-95 ${focusRing}`}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <Button
                            variant="icon"
                            onClick={() => addItem(product, 1)}
                            aria-label={`Agregar ${product.name} al carrito`}
                        >
                            <CartLarge5 aria-hidden="true" />
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}

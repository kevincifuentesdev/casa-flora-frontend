"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CartAdd } from "reicon-react";

import { useCart } from "@/features/cart/hooks/useCart";
import { formatPrice, type Product } from "@/features/products/domain/product";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
}

export default function ProductDetailModal({
    product,
    onClose,
}: ProductDetailModalProps) {
    const { addItem, getItemQuantity, openCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (!product) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [product, handleKeyDown]);

    if (!product) return null;

    const quantityInCart = getItemQuantity(product.id);

    const handleAddToCart = () => {
        addItem(product, quantity);
        setIsAdded(true);
        setTimeout(() => {
            onClose();
            openCart();
        }, 300);
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-detail-modal-title"
            className="fixed inset-0 z-60 flex items-end justify-center bg-black/55 p-0 backdrop-blur-xs sm:items-center sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="custom-scrollbar max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-foreground-muted/20 bg-surface p-5 pb-8 shadow-(--shadow-ambient-md) sm:max-h-[88dvh] sm:max-w-xl sm:rounded-2xl sm:p-6 sm:pb-6">
                <div
                    className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground-muted/25 sm:hidden"
                    aria-hidden="true"
                />

                <div className="flex items-center justify-between border-b border-foreground-muted/15 pb-3">
                    <span className="text-xs font-bold tracking-wider text-accent uppercase">
                        Detalle del plato
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar detalle"
                        className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/20 bg-background text-foreground-muted transition hover:bg-background-alt hover:text-foreground active:scale-95 ${focusRing}`}
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="size-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 5l10 10M15 5L5 15"
                            />
                        </svg>
                    </button>
                </div>

                <div className="relative mt-4 h-60 w-full overflow-hidden rounded-2xl sm:h-72">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 640px) 560px, 100vw"
                        className="object-cover"
                    />
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                        {product.categories.map((cat) => (
                            <span
                                key={cat}
                                className="rounded-full bg-[rgb(255_248_246/90%)] px-3 py-1 text-xs font-semibold text-accent backdrop-blur-xs dark:bg-[rgb(44_30_26/90%)]"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                        <h2
                            id="product-detail-modal-title"
                            className="m-0 font-display text-2xl font-bold text-primary sm:text-3xl"
                        >
                            {product.name}
                        </h2>
                        <span className="text-xl font-bold text-secondary sm:text-2xl">
                            {formatPrice(product.price)}
                        </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
                        {product.description}
                    </p>

                    {quantityInCart > 0 && (
                        <p className="mt-2 text-xs font-semibold text-accent">
                            Actualmente tienes {quantityInCart}{" "}
                            {quantityInCart === 1 ? "unidad" : "unidades"} en tu
                            bolsa.
                        </p>
                    )}
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-foreground-muted/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center justify-between gap-3 sm:justify-start">
                        <span className="text-xs font-bold tracking-wider text-foreground uppercase">
                            Cantidad:
                        </span>
                        <div
                            role="group"
                            aria-label={`Cantidad de ${product.name} a agregar`}
                            className="inline-flex items-center rounded-full border border-primary/25 bg-background p-1"
                        >
                            <button
                                type="button"
                                disabled={quantity <= 1}
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                aria-label="Disminuir cantidad"
                                className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-base font-bold text-primary transition hover:bg-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                            >
                                -
                            </button>
                            <span className="min-w-10 text-center text-sm font-bold text-primary">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                disabled={quantity >= 99}
                                onClick={() =>
                                    setQuantity((q) => Math.min(99, q + 1))
                                }
                                aria-label="Aumentar cantidad"
                                className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-base font-bold text-primary transition hover:bg-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-(--shadow-ambient-sm) transition hover:opacity-90 active:scale-98 ${focusRing}`}
                    >
                        <CartAdd
                            width={22}
                            height={22}
                            aria-hidden="true"
                            className="size-5 text-inherit"
                        />
                        <span>
                            {isAdded
                                ? "¡Agregado a la bolsa!"
                                : `Agregar al carrito • ${formatPrice(product.price * quantity)}`}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

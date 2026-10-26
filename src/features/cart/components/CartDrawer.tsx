"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/features/auth/hooks/useSession";
import { formatPrice } from "@/features/products/domain/product";
import { MAX_ITEM_QUANTITY } from "../domain/cart";
import { useCart } from "../hooks/useCart";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export default function CartDrawer() {
    const pathname = usePathname();
    const { session } = useSession();
    const {
        items,
        totalItems,
        subtotal,
        estimatedPoints,
        isOpen,
        closeCart,
        addItem,
        decrementItem,
        removeItem,
        clearCart,
    } = useCart();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeCart();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeCart]);

    if (!isOpen || pathname === "/onboarding") {
        return null;
    }

    const isAuthenticated = Boolean(session?.user);
    const currentPoints = session?.user?.loyalty?.points ?? 0;
    const nextRewardName =
        session?.user?.loyalty?.rewardName ?? "Recompensa artesanal";

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed inset-0 z-60 flex items-end justify-end bg-black/55 backdrop-blur-xs sm:items-stretch"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    closeCart();
                }
            }}
        >
            <div className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-foreground-muted/15 bg-surface shadow-(--shadow-ambient-md) sm:h-dvh sm:max-h-none sm:max-w-md sm:rounded-none sm:rounded-l-2xl sm:border-t-0 sm:border-l">
                <div className="flex items-center justify-between gap-3 border-b border-foreground-muted/15 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2
                                id="cart-drawer-title"
                                className="m-0 font-display text-2xl font-bold text-primary"
                            >
                                Tu Bolsa
                            </h2>
                            {totalItems > 0 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary dark:bg-primary/25 dark:text-foreground">
                                    {totalItems}{" "}
                                    {totalItems === 1 ? "plato" : "platos"}
                                </span>
                            )}
                        </div>
                        <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                            Cocina artesanal lista para compartir en tu mesa.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-destructive/30 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 ${focusRing}`}
                            >
                                Vaciar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={closeCart}
                            aria-label="Cerrar carrito de compras"
                            className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-foreground-muted/25 bg-background text-foreground-muted transition hover:border-primary/40 hover:text-foreground ${focusRing}`}
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
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                    {!isAuthenticated ? (
                        <div className="mb-4 rounded-2xl border border-[#e5c5b5] bg-[#fbf5e8] p-4 dark:border-foreground-muted/20 dark:bg-background-alt">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="size-4 text-[#f5c58b]"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="m-0 font-display text-base font-bold text-primary">
                                        {estimatedPoints > 0
                                            ? `Suma +${estimatedPoints} ${estimatedPoints === 1 ? "punto" : "puntos"} con tu pedido`
                                            : "Gana puntos en el Club Casa Flora"}
                                    </p>
                                    <p className="m-0 mt-1 text-xs/5 text-foreground">
                                        Crea tu cuenta o inicia sesión para
                                        acumular puntos por cada plato, canjear
                                        recompensas artesanales, guardar tus
                                        direcciones y recibir recomendaciones a
                                        tu medida.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                                <Link
                                    href="/signup"
                                    onClick={closeCart}
                                    className={`inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90 ${focusRing}`}
                                >
                                    Crear cuenta
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={closeCart}
                                    className={`inline-flex min-h-11 items-center justify-center rounded-full border border-primary/40 bg-surface px-4 py-2 text-xs font-bold text-primary no-underline transition hover:bg-background dark:border-foreground-muted/35 dark:text-foreground ${focusRing}`}
                                >
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-[#691a22] to-[#4b030f] px-4 py-3 text-white shadow-xs">
                            <div className="min-w-0">
                                <p className="m-0 text-[10px] font-bold tracking-[0.12em] text-[#e8b98a] uppercase">
                                    CLUB CASA FLORA
                                </p>
                                <p className="m-0 mt-0.5 truncate text-xs text-white/90">
                                    {estimatedPoints > 0
                                        ? `Esta bolsa suma +${estimatedPoints} pts para ${nextRewardName}`
                                        : `Acumula puntos para ${nextRewardName}`}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#f5c58b] px-3 py-1 text-xs font-bold text-[#2b1d19]">
                                {currentPoints} pts
                            </span>
                        </div>
                    )}

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-foreground-muted/15 bg-background px-5 py-10 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full bg-[#f6ded8] text-[#691a22]">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"
                                    />
                                </svg>
                            </span>
                            <h3 className="m-0 mt-4 font-display text-xl font-bold text-primary">
                                Tu bolsa está vacía
                            </h3>
                            <p className="m-0 mt-1.5 max-w-xs text-xs/5 text-foreground-muted">
                                Aún no has agregado platos de nuestra cocina.
                                Explora la carta y añade tus favoritos sin
                                necesidad de iniciar sesión.
                            </p>
                            <Link
                                href="/menu"
                                onClick={closeCart}
                                className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90 ${focusRing}`}
                            >
                                Explorar el menú
                            </Link>
                        </div>
                    ) : (
                        <ul
                            aria-label="Productos en tu bolsa"
                            className="m-0 list-none divide-y divide-foreground-muted/15 p-0"
                        >
                            {items.map((item) => {
                                const lineTotal =
                                    item.product.price * item.quantity;
                                const isMaxReached =
                                    item.quantity >= MAX_ITEM_QUANTITY;

                                return (
                                    <li
                                        key={item.product.id}
                                        className="py-4 first:pt-1 last:pb-1"
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <div className="relative size-18 shrink-0 overflow-hidden rounded-xl border border-foreground-muted/10 bg-background">
                                                <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    fill
                                                    sizes="72px"
                                                    className="object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="m-0 font-display text-base leading-snug font-bold text-primary">
                                                        {item.product.name}
                                                    </h3>
                                                    <span className="shrink-0 text-sm font-extrabold text-foreground">
                                                        {formatPrice(lineTotal)}
                                                    </span>
                                                </div>

                                                <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                                    {formatPrice(
                                                        item.product.price,
                                                    )}{" "}
                                                    c/u
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                    <div
                                                        role="group"
                                                        aria-label={`Cantidad de ${item.product.name}`}
                                                        className="inline-flex items-center rounded-full border border-foreground-muted/25 bg-background p-0.5"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                decrementItem(
                                                                    item.product
                                                                        .id,
                                                                )
                                                            }
                                                            aria-label={
                                                                item.quantity ===
                                                                1
                                                                    ? `Quitar ${item.product.name} de la bolsa`
                                                                    : `Disminuir cantidad de ${item.product.name}`
                                                            }
                                                            className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-sm font-bold text-foreground transition hover:bg-primary/10 active:scale-95 ${focusRing}`}
                                                        >
                                                            -
                                                        </button>
                                                        <span
                                                            aria-live="polite"
                                                            className="min-w-8 text-center text-xs font-bold text-foreground"
                                                        >
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isMaxReached
                                                            }
                                                            onClick={() =>
                                                                addItem(
                                                                    item.product,
                                                                    1,
                                                                )
                                                            }
                                                            aria-label={`Aumentar cantidad de ${item.product.name}`}
                                                            className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-sm font-bold text-foreground transition hover:bg-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.product.id,
                                                            )
                                                        }
                                                        aria-label={`Eliminar ${item.product.name} del carrito`}
                                                        className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/30 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 ${focusRing}`}
                                                    >
                                                        <svg
                                                            aria-hidden="true"
                                                            viewBox="0 0 20 20"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            className="size-3.5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 6l8 8M14 6l-8 8"
                                                            />
                                                        </svg>
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-foreground-muted/15 bg-background px-5 py-4 pb-6 sm:px-6">
                        <div className="flex items-center justify-between text-xs text-foreground-muted">
                            <span>
                                {totalItems}{" "}
                                {totalItems === 1
                                    ? "producto seleccionado"
                                    : "productos seleccionados"}
                            </span>
                            <span className="font-semibold text-accent">
                                +{estimatedPoints}{" "}
                                {estimatedPoints === 1
                                    ? "punto estimado"
                                    : "puntos estimados"}
                            </span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-display text-lg font-bold text-primary">
                                Subtotal
                            </span>
                            <span className="font-display text-2xl font-bold text-primary">
                                {formatPrice(subtotal)}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                            <Link
                                href="/menu"
                                onClick={closeCart}
                                className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-accent bg-surface px-5 py-2.5 text-xs font-bold text-primary no-underline transition hover:bg-background-alt ${focusRing}`}
                            >
                                Seguir explorando la carta
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    href="/login"
                                    onClick={closeCart}
                                    className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground no-underline transition hover:opacity-90 ${focusRing}`}
                                >
                                    Entrar y guardar puntos
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

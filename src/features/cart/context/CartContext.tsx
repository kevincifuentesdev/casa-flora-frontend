"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { Product } from "@/features/products/domain/product";
import {
    CART_STORAGE_KEY,
    MAX_ITEM_QUANTITY,
    calculateCartSubtotal,
    calculateCartTotalItems,
    calculateEstimatedPoints,
    type CartItem,
} from "../domain/cart";

export interface CartContextValue {
    items: CartItem[];
    totalItems: number;
    subtotal: number;
    estimatedPoints: number;
    isOpen: boolean;
    isHydrated: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addItem: (product: Product, quantity?: number) => void;
    decrementItem: (productId: string) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        const validItems: CartItem[] = [];
        for (const entry of parsed) {
            if (
                entry &&
                typeof entry === "object" &&
                "product" in entry &&
                "quantity" in entry &&
                typeof entry.quantity === "number" &&
                entry.quantity > 0 &&
                entry.product &&
                typeof entry.product === "object" &&
                "id" in entry.product &&
                typeof entry.product.id === "string" &&
                "name" in entry.product &&
                typeof entry.product.name === "string" &&
                "price" in entry.product &&
                typeof entry.product.price === "number"
            ) {
                validItems.push({
                    product: entry.product as Product,
                    quantity: Math.min(
                        MAX_ITEM_QUANTITY,
                        Math.max(1, Math.floor(entry.quantity)),
                    ),
                });
            }
        }

        return validItems;
    } catch {
        return [];
    }
}

function writeStoredCart(items: CartItem[]): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Ignore storage quota errors in restricted browsing modes.
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;

        Promise.resolve().then(() => {
            if (cancelled) return;
            const stored = readStoredCart();
            setItems(stored);
            setIsHydrated(true);
        });

        const handleStorage = (event: StorageEvent) => {
            if (event.key === CART_STORAGE_KEY) {
                setItems(readStoredCart());
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => {
            cancelled = true;
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const openCart = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeCart = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleCart = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const addItem = useCallback((product: Product, quantity = 1) => {
        const safeDelta = Math.max(1, Math.floor(quantity));
        setItems((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.product.id === product.id,
            );
            let next: CartItem[];
            if (existingIndex === -1) {
                next = [
                    ...prev,
                    {
                        product,
                        quantity: Math.min(MAX_ITEM_QUANTITY, safeDelta),
                    },
                ];
            } else {
                next = prev.map((item, idx) =>
                    idx === existingIndex
                        ? {
                              ...item,
                              product,
                              quantity: Math.min(
                                  MAX_ITEM_QUANTITY,
                                  item.quantity + safeDelta,
                              ),
                          }
                        : item,
                );
            }
            writeStoredCart(next);
            return next;
        });
    }, []);

    const decrementItem = useCallback((productId: string) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.product.id === productId);
            if (!existing) {
                return prev;
            }
            const next =
                existing.quantity <= 1
                    ? prev.filter((item) => item.product.id !== productId)
                    : prev.map((item) =>
                          item.product.id === productId
                              ? { ...item, quantity: item.quantity - 1 }
                              : item,
                      );
            writeStoredCart(next);
            return next;
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems((prev) => {
            const next = prev.filter((item) => item.product.id !== productId);
            writeStoredCart(next);
            return next;
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        writeStoredCart([]);
    }, []);

    const getItemQuantity = useCallback(
        (productId: string) => {
            const found = items.find((item) => item.product.id === productId);
            return found ? found.quantity : 0;
        },
        [items],
    );

    const totalItems = useMemo(() => calculateCartTotalItems(items), [items]);
    const subtotal = useMemo(() => calculateCartSubtotal(items), [items]);
    const estimatedPoints = useMemo(
        () => calculateEstimatedPoints(subtotal),
        [subtotal],
    );

    const value = useMemo<CartContextValue>(
        () => ({
            items,
            totalItems,
            subtotal,
            estimatedPoints,
            isOpen,
            isHydrated,
            openCart,
            closeCart,
            toggleCart,
            addItem,
            decrementItem,
            removeItem,
            clearCart,
            getItemQuantity,
        }),
        [
            items,
            totalItems,
            subtotal,
            estimatedPoints,
            isOpen,
            isHydrated,
            openCart,
            closeCart,
            toggleCart,
            addItem,
            decrementItem,
            removeItem,
            clearCart,
            getItemQuantity,
        ],
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCartContext(): CartContextValue {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCartContext must be used within a CartProvider");
    }
    return context;
}


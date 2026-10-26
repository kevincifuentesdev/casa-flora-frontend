import type { Product } from "@/features/products/domain/product";

export interface CartItem {
    product: Product;
    quantity: number;
}

export const CART_STORAGE_KEY = "casa-flora:cart:v1";
export const MAX_ITEM_QUANTITY = 20;

export function calculateCartSubtotal(items: readonly CartItem[]): number {
    return items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
    );
}

export function calculateCartTotalItems(items: readonly CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateEstimatedPoints(subtotal: number): number {
    if (subtotal <= 0) {
        return 0;
    }
    return Math.max(1, Math.floor(subtotal / 10000));
}


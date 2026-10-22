import { getProducts } from "@/features/products/services/productService";
import {
    getAllCategories,
    getMaxPrice,
} from "@/features/menu/domain/menuFilters";

export function getMenuProducts() {
    return getProducts();
}

export function getMenuCategories(): string[] {
    return getAllCategories(getProducts());
}

export function getMenuMaxPrice(): number {
    return getMaxPrice(getProducts());
}

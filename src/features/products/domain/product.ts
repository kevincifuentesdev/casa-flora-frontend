export interface Product {
    id: string;
    name: string;
    price: number;
    categories: string[];
    description: string;
    imageUrl: string;
}

export function formatPrice(price: number): string {
    return `$${price.toLocaleString("es-CO")}`;
}

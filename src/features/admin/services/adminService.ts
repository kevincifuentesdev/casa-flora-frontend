import type { OrderRecord } from "@/features/auth/domain/session";
import type {
    BookingRecord,
    BookingStatus,
    EnvironmentId,
    SlotAvailability,
} from "@/features/booking/domain/types";
import {
    ApiClientError,
    apiRequest,
} from "@/features/common/services/apiClient";
import type { Product } from "@/features/products/domain/product";

export type OrderStatus = OrderRecord["status"];
export type BookingAdminSort = "earliest" | "latest" | "diners-desc";

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface AdminOrderQuery {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
}

export interface AdminBookingQuery {
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    environment?: EnvironmentId;
    status?: BookingStatus;
    search?: string;
    sort?: BookingAdminSort;
    page?: number;
    limit?: number;
}

export interface AdminProductQuery {
    search?: string;
    categories?: string[];
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
}

export interface UpdateBookingAdminPayload {
    environment?: EnvironmentId;
    date?: string;
    time?: string;
    diners?: number;
    status?: BookingStatus;
}

export interface CreateAdminProductPayload {
    id: string;
    name: string;
    price: number;
    categories: string[];
    description: string;
    imageUrl: string;
    available: boolean;
    sortOrder: number;
}

export interface UpdateAdminProductPayload {
    name?: string;
    price?: number;
    categories?: string[];
    description?: string;
    imageUrl?: string;
    available?: boolean;
    sortOrder?: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiClientError) {
        return error.message;
    }
    return fallback;
}

export async function fetchAdminOrders(
    query: AdminOrderQuery = {},
): Promise<{
    orders?: OrderRecord[];
    meta?: PaginationMeta;
    error?: string;
    status?: number;
}> {
    try {
        const params = new URLSearchParams();
        if (query.status) params.set("status", query.status);
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.page !== undefined) params.set("page", String(query.page));
        if (query.limit !== undefined) params.set("limit", String(query.limit));
        const qs = params.toString();
        const path = qs ? `/api/orders/admin?${qs}` : "/api/orders/admin";
        const res = await apiRequest<{
            data: OrderRecord[];
            meta?: PaginationMeta;
        }>(path);
        return { orders: res.data, meta: res.meta };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible cargar los pedidos del restaurante.",
            ),
            status: error instanceof ApiClientError ? error.status : undefined,
        };
    }
}

export async function updateAdminOrderStatus(
    orderId: string,
    status: OrderStatus,
): Promise<{ order?: OrderRecord; error?: string }> {
    try {
        const res = await apiRequest<{ data: OrderRecord }>(
            `/api/orders/${encodeURIComponent(orderId)}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({ status }),
            },
        );
        return { order: res.data };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible actualizar el estado del pedido.",
            ),
        };
    }
}

export async function fetchAdminBookings(
    query: AdminBookingQuery = {},
): Promise<{
    bookings?: BookingRecord[];
    meta?: PaginationMeta;
    error?: string;
    status?: number;
}> {
    try {
        const params = new URLSearchParams();
        if (query.date) params.set("date", query.date);
        if (query.dateFrom) params.set("dateFrom", query.dateFrom);
        if (query.dateTo) params.set("dateTo", query.dateTo);
        if (query.environment) params.set("environment", query.environment);
        if (query.status) params.set("status", query.status);
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.sort) params.set("sort", query.sort);
        if (query.page !== undefined) params.set("page", String(query.page));
        if (query.limit !== undefined) params.set("limit", String(query.limit));

        const qs = params.toString();
        const path = qs ? `/api/bookings/admin?${qs}` : "/api/bookings/admin";
        const res = await apiRequest<{
            data: BookingRecord[];
            meta?: PaginationMeta;
        }>(path);
        return { bookings: res.data, meta: res.meta };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible cargar las reservas de mesa.",
            ),
            status: error instanceof ApiClientError ? error.status : undefined,
        };
    }
}

export async function fetchAdminBookingById(
    bookingId: string,
): Promise<{ booking?: BookingRecord; error?: string }> {
    try {
        const res = await apiRequest<{ data: BookingRecord }>(
            `/api/bookings/${encodeURIComponent(bookingId)}`,
        );
        return { booking: res.data };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible consultar el detalle de la reserva.",
            ),
        };
    }
}

export async function updateAdminBooking(
    bookingId: string,
    payload: UpdateBookingAdminPayload,
): Promise<{ booking?: BookingRecord; error?: string }> {
    try {
        const res = await apiRequest<{ data: BookingRecord }>(
            `/api/bookings/${encodeURIComponent(bookingId)}`,
            {
                method: "PATCH",
                body: JSON.stringify(payload),
            },
        );
        return { booking: res.data };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible actualizar la reserva.",
            ),
        };
    }
}

export async function cancelAdminBooking(
    bookingId: string,
): Promise<{ booking?: BookingRecord; error?: string }> {
    try {
        const res = await apiRequest<{ data: BookingRecord }>(
            `/api/bookings/${encodeURIComponent(bookingId)}/cancel`,
            {
                method: "PATCH",
            },
        );
        return { booking: res.data };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible cancelar la reserva.",
            ),
        };
    }
}

export async function fetchDaySlotOccupancy(date: string): Promise<{
    interior?: SlotAvailability[];
    patio?: SlotAvailability[];
    error?: string;
}> {
    try {
        const [interiorRes, patioRes] = await Promise.all([
            apiRequest<{
                data: { slots: SlotAvailability[] };
            }>(
                `/api/bookings/availability?date=${encodeURIComponent(date)}&environment=interior`,
            ),
            apiRequest<{
                data: { slots: SlotAvailability[] };
            }>(
                `/api/bookings/availability?date=${encodeURIComponent(date)}&environment=patio`,
            ),
        ]);
        return {
            interior: interiorRes.data.slots,
            patio: patioRes.data.slots,
        };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No se pudo consultar el aforo por turno para la fecha seleccionada.",
            ),
        };
    }
}

export async function fetchAdminProducts(
    query: AdminProductQuery = {},
): Promise<{
    products?: Product[];
    categories?: string[];
    meta?: PaginationMeta;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.categories && query.categories.length > 0) {
            for (const cat of query.categories) {
                params.append("category", cat);
            }
        }
        if (query.maxPrice !== undefined)
            params.set("maxPrice", String(query.maxPrice));
        if (query.sort) params.set("sort", query.sort);
        if (query.page !== undefined) params.set("page", String(query.page));
        if (query.limit !== undefined) params.set("limit", String(query.limit));

        const qs = params.toString();
        const path = qs ? `/api/products/admin?${qs}` : "/api/products/admin";
        const res = await apiRequest<{
            data: Product[];
            meta?: { categories: string[] } & Partial<PaginationMeta>;
        }>(path);
        return {
            products: res.data,
            categories: res.meta?.categories,
            meta: res.meta as PaginationMeta | undefined,
        };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible cargar el catálogo de platos.",
            ),
        };
    }
}

export async function createAdminProduct(
    payload: CreateAdminProductPayload,
): Promise<{ product?: Product; error?: string }> {
    try {
        const res = await apiRequest<{ data: Product }>("/api/products", {
            method: "POST",
            body: JSON.stringify(payload),
        });
        return { product: res.data };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible crear el plato. Verifica los datos ingresados.",
            ),
        };
    }
}

export async function updateAdminProduct(
    productId: string,
    payload: UpdateAdminProductPayload,
): Promise<{ product?: Product; error?: string }> {
    try {
        const res = await apiRequest<{ data: Product }>(
            `/api/products/${encodeURIComponent(productId)}`,
            {
                method: "PATCH",
                body: JSON.stringify(payload),
            },
        );
        return { product: res.data };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible guardar los cambios del plato.",
            ),
        };
    }
}

export async function deleteAdminProduct(
    productId: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        await apiRequest(`/api/products/${encodeURIComponent(productId)}`, {
            method: "DELETE",
        });
        return { ok: true };
    } catch (error) {
        return {
            ok: false,
            error: getErrorMessage(
                error,
                "No fue posible eliminar el plato del catálogo.",
            ),
        };
    }
}


const MAX_IMAGE_SIDE = 1400;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function optimizeImage(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) {
        bitmap.close();
        return file;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.85),
    );
    return blob && blob.type === "image/webp" ? blob : file;
}

export async function uploadProductImage(
    file: File,
): Promise<{ url?: string; error?: string }> {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return { error: "Selecciona una imagen JPG, PNG o WebP." };
    }
    try {
        const body = await optimizeImage(file);
        if (body.size > 4 * 1024 * 1024) {
            return { error: "La imagen supera los 4 MB permitidos." };
        }
        const res = await apiRequest<{ data: { url: string } }>(
            "/api/uploads/products",
            {
                method: "POST",
                headers: { "Content-Type": body.type || file.type },
                body,
            },
        );
        return { url: res.data.url };
    } catch (error) {
        return {
            error: getErrorMessage(
                error,
                "No fue posible subir la fotografía del plato.",
            ),
        };
    }
}

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

export interface AdminOrderQuery {
    status?: OrderStatus;
    search?: string;
}

export interface AdminBookingQuery {
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    environment?: EnvironmentId;
    status?: BookingStatus;
    search?: string;
    sort?: BookingAdminSort;
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
): Promise<{ orders?: OrderRecord[]; error?: string; status?: number }> {
    try {
        const params = new URLSearchParams();
        if (query.status) params.set("status", query.status);
        if (query.search?.trim()) params.set("search", query.search.trim());
        const qs = params.toString();
        const path = qs ? `/api/orders/admin?${qs}` : "/api/orders/admin";
        const res = await apiRequest<{ data: OrderRecord[] }>(path);
        return { orders: res.data };
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
): Promise<{ bookings?: BookingRecord[]; error?: string; status?: number }> {
    try {
        const params = new URLSearchParams();
        if (query.date) params.set("date", query.date);
        if (query.dateFrom) params.set("dateFrom", query.dateFrom);
        if (query.dateTo) params.set("dateTo", query.dateTo);
        if (query.environment) params.set("environment", query.environment);
        if (query.status) params.set("status", query.status);
        if (query.search?.trim()) params.set("search", query.search.trim());
        if (query.sort) params.set("sort", query.sort);

        const qs = params.toString();
        const path = qs ? `/api/bookings/admin?${qs}` : "/api/bookings/admin";
        const res = await apiRequest<{ data: BookingRecord[] }>(path);
        return { bookings: res.data };
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

export async function fetchAdminProducts(): Promise<{
    products?: Product[];
    categories?: string[];
    error?: string;
}> {
    try {
        const res = await apiRequest<{
            data: Product[];
            meta?: { categories: string[] };
        }>("/api/products/admin");
        return {
            products: res.data,
            categories: res.meta?.categories,
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


import type { OrderRecord } from "@/features/auth/domain/session";
import { getFrontendEnv } from "@/features/common/config/env";
import {
    ApiClientError,
    apiRequest,
} from "@/features/common/services/apiClient";
import type { DeliveryMethod } from "../domain/checkoutValidation";

export interface CreateCheckoutPayload {
    items: Array<{ productId: string; quantity: number }>;
    deliveryMethod: DeliveryMethod;
    addressId?: string;
    deliveryAddress?: {
        label: string;
        addressLine: string;
        neighborhood: string;
        city: string;
        details?: string | null;
        saveToProfile?: boolean;
    };
}

export interface CheckoutSessionData {
    preferenceId: string;
    checkoutUrl: string;
    sandboxCheckoutUrl: string;
    deliveryMethod: DeliveryMethod;
    addressLabel: string;
    totalAmount: number;
    pointsEarned: number;
    order: OrderRecord | null;
}

export async function createCartCheckout(
    payload: CreateCheckoutPayload,
): Promise<{ session?: CheckoutSessionData; error?: string }> {
    const env = getFrontendEnv();
    if (!env.isPaymentConfigured) {
        return {
            error: "La clave pública de Mercado Pago (NEXT_PUBLIC_PAYMENT_PUBLIC_API) no está configurada.",
        };
    }

    try {
        const response = await apiRequest<{ data: CheckoutSessionData }>(
            "/api/orders/checkout",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );

        return { session: response.data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { error: error.message };
        }
        return {
            error: "No fue posible iniciar el pago con Mercado Pago. Intenta nuevamente.",
        };
    }
}


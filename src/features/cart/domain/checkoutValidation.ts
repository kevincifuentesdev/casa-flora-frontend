import type { CartItem } from "./cart";

export type DeliveryMethod = "pickup" | "delivery";

export interface CheckoutAddressDraft {
    label: string;
    addressLine: string;
    neighborhood: string;
    city: string;
    details: string;
    saveToProfile: boolean;
}

export interface CheckoutDraft {
    items: readonly CartItem[];
    deliveryMethod: DeliveryMethod;
    useCustomAddress: boolean;
    selectedAddressId: string | null;
    customAddress: CheckoutAddressDraft;
}

export interface CheckoutValidationErrors {
    items?: string;
    addressSelection?: string;
    addressLine?: string;
    neighborhood?: string;
    label?: string;
}

export function validateCheckoutDraft(
    draft: CheckoutDraft,
): CheckoutValidationErrors {
    const errors: CheckoutValidationErrors = {};

    if (!draft.items || draft.items.length === 0) {
        errors.items = "Agrega al menos un plato a tu bolsa antes de pagar.";
        return errors;
    }

    if (draft.deliveryMethod === "pickup") {
        return errors;
    }

    if (!draft.useCustomAddress) {
        if (!draft.selectedAddressId) {
            errors.addressSelection =
                "Selecciona una dirección guardada o ingresa una nueva dirección de entrega.";
        }
        return errors;
    }

    const trimmedLabel = draft.customAddress.label.trim();
    const trimmedLine = draft.customAddress.addressLine.trim();
    const trimmedNeighborhood = draft.customAddress.neighborhood.trim();

    if (trimmedLabel.length > 0 && trimmedLabel.length < 2) {
        errors.label = "La etiqueta debe tener al menos 2 caracteres.";
    }

    if (trimmedLine.length < 5) {
        errors.addressLine =
            "Ingresa una dirección válida (mínimo 5 caracteres, ej. Calle 10 # 43A-30).";
    } else if (trimmedLine.length > 140) {
        errors.addressLine =
            "La dirección no puede superar los 140 caracteres.";
    }

    if (trimmedNeighborhood.length < 2) {
        errors.neighborhood =
            "Ingresa el barrio para el envío a domicilio (ej. El Poblado).";
    } else if (trimmedNeighborhood.length > 80) {
        errors.neighborhood = "El barrio no puede superar los 80 caracteres.";
    }

    return errors;
}


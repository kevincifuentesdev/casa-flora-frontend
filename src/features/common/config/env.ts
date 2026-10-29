const API_URL_FALLBACK = "http://localhost:4000";
const PAYMENT_PUBLIC_KEY_PATTERN = /^(APP_USR-|TEST-)[0-9a-fA-F-]{16,}$/;

export interface FrontendEnv {
    apiUrl: string;
    paymentPublicKey: string;
    isPaymentConfigured: boolean;
}

export function getFrontendEnv(): FrontendEnv {
    const rawApiUrl =
        process.env.NEXT_PUBLIC_API_URL?.trim() || API_URL_FALLBACK;
    const rawPaymentPublicKey =
        process.env.NEXT_PUBLIC_PAYMENT_PUBLIC_API?.trim() ?? "";

    let apiUrl = API_URL_FALLBACK;
    try {
        apiUrl = new URL(rawApiUrl).origin;
    } catch {
        apiUrl = API_URL_FALLBACK;
    }

    const isPaymentConfigured =
        PAYMENT_PUBLIC_KEY_PATTERN.test(rawPaymentPublicKey);

    return {
        apiUrl,
        paymentPublicKey: rawPaymentPublicKey,
        isPaymentConfigured,
    };
}


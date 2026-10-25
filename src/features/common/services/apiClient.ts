export const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export interface ApiErrorPayload {
    error?: {
        code?: string;
        message?: string;
        details?: Record<string, string>;
    };
}

export class ApiClientError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details?: Record<string, string>;

    constructor(
        status: number,
        code: string,
        message: string,
        details?: Record<string, string>,
    ) {
        super(message);
        this.name = "ApiClientError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export async function apiRequest<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const headers = new Headers(init.headers);

    if (init.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
    });

    if (response.status === 204) {
        return undefined as T;
    }

    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const errObj = (body as ApiErrorPayload | null)?.error;
        throw new ApiClientError(
            response.status,
            errObj?.code ?? `HTTP_${response.status}`,
            errObj?.message ??
                "No fue posible completar la solicitud con el servidor.",
            errObj?.details,
        );
    }

    return body as T;
}

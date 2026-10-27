import {
    ApiClientError,
    apiRequest,
} from "@/features/common/services/apiClient";
import type { Product } from "@/features/products/domain/product";
import { isEmailIdentifier } from "../domain/authValidation";
import type {
    DietPreference,
    FavoriteMoment,
    LoginDraft,
    LoyaltySummary,
    OrderRecord,
    PaymentMethodRecord,
    PaymentMethodType,
    Session,
    SessionUser,
    SignUpDraft,
    SpiceTolerance,
    UserAddressRecord,
    UserPreferences,
} from "../domain/session";
import { authClient } from "./authClient";
import { clearSession, getSessionSnapshot, saveSession } from "./sessionService";

export interface AuthServiceResult {
    session?: Session;
    error?: string;
}

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    username?: string;
    onboardingCompleted?: boolean;
    dietPreference?: DietPreference | null;
    spiceTolerance?: SpiceTolerance | null;
    favoriteMoment?: FavoriteMoment | null;
}

export interface CreateUserAddressPayload {
    label: string;
    addressLine: string;
    neighborhood: string;
    city?: string;
    details?: string | null;
    isDefault?: boolean;
}

export interface CreatePaymentMethodPayload {
    type: PaymentMethodType;
    brand: string;
    lastFour?: string | null;
    holderName?: string | null;
    isDefault?: boolean;
}

export interface CompleteOnboardingPayload {
    address?: CreateUserAddressPayload;
    paymentMethod?: CreatePaymentMethodPayload;
    dietPreference?: DietPreference | null;
    spiceTolerance?: SpiceTolerance | null;
    favoriteMoment?: FavoriteMoment | null;
}

export interface CreateOrderPayload {
    items: Array<{ productId: string; quantity: number }>;
    addressId?: string;
    paymentMethodId?: string;
}

function buildDefaultLoyalty(points: number): LoyaltySummary {
    const safePoints = Math.max(0, Math.floor(points));
    const nextRewardGoal = 15;
    const pointsInCurrentCycle = safePoints % nextRewardGoal;
    return {
        points: safePoints,
        nextRewardGoal,
        pointsInCurrentCycle,
        pointsRemaining: nextRewardGoal - pointsInCurrentCycle,
        progressPercent: Math.min(
            100,
            Math.round((pointsInCurrentCycle / nextRewardGoal) * 100),
        ),
        rewardName: "Empanadas de la Abuela",
        availableRewards: Math.floor(safePoints / nextRewardGoal),
    };
}

function mapBetterAuthUser(
    rawUser: Record<string, unknown>,
    fallback: Partial<SessionUser> = {},
): SessionUser {
    const firstName =
        (typeof rawUser.firstName === "string" && rawUser.firstName) ||
        fallback.firstName ||
        "";
    const lastName =
        (typeof rawUser.lastName === "string" && rawUser.lastName) ||
        fallback.lastName ||
        "";
    const fullName =
        (typeof rawUser.name === "string" && rawUser.name) ||
        `${firstName} ${lastName}`.trim() ||
        fallback.name ||
        "Cliente";
    const points =
        typeof rawUser.points === "number"
            ? rawUser.points
            : (fallback.points ?? 0);

    const rawPrefs =
        typeof rawUser.preferences === "object" && rawUser.preferences !== null
            ? (rawUser.preferences as Partial<UserPreferences>)
            : undefined;

    const preferences: UserPreferences = {
        dietPreference:
            rawPrefs?.dietPreference ??
            fallback.preferences?.dietPreference ??
            null,
        spiceTolerance:
            rawPrefs?.spiceTolerance ??
            fallback.preferences?.spiceTolerance ??
            null,
        favoriteMoment:
            rawPrefs?.favoriteMoment ??
            fallback.preferences?.favoriteMoment ??
            null,
    };

    const loyalty: LoyaltySummary =
        typeof rawUser.loyalty === "object" && rawUser.loyalty !== null
            ? (rawUser.loyalty as LoyaltySummary)
            : (fallback.loyalty ?? buildDefaultLoyalty(points));

    const addresses: UserAddressRecord[] = Array.isArray(rawUser.addresses)
        ? (rawUser.addresses as UserAddressRecord[])
        : (fallback.addresses ?? []);

    const paymentMethods: PaymentMethodRecord[] = Array.isArray(
        rawUser.paymentMethods,
    )
        ? (rawUser.paymentMethods as PaymentMethodRecord[])
        : (fallback.paymentMethods ?? []);

    const recommendedProduct: Product | null =
        typeof rawUser.recommendedProduct === "object" &&
        rawUser.recommendedProduct !== null
            ? (rawUser.recommendedProduct as Product)
            : (fallback.recommendedProduct ?? null);

    const orders: OrderRecord[] = Array.isArray(rawUser.orders)
        ? (rawUser.orders as OrderRecord[])
        : (fallback.orders ?? []);

    return {
        id:
            (typeof rawUser.id === "string" && rawUser.id) ||
            fallback.id ||
            crypto.randomUUID(),
        name: fullName,
        firstName: firstName || fullName.split(" ")[0] || fullName,
        lastName,
        birthDate:
            (typeof rawUser.birthDate === "string" && rawUser.birthDate) ||
            fallback.birthDate ||
            "",
        username:
            (typeof rawUser.username === "string" && rawUser.username) ||
            fallback.username ||
            "",
        email:
            (typeof rawUser.email === "string" && rawUser.email) ||
            fallback.email ||
            "",
        role:
            rawUser.role === "admin"
                ? "admin"
                : (fallback.role ?? "customer"),
        points,
        onboardingCompleted:
            typeof rawUser.onboardingCompleted === "boolean"
                ? rawUser.onboardingCompleted
                : (fallback.onboardingCompleted ?? false),
        preferences,
        loyalty,
        addresses,
        paymentMethods,
        recommendedProduct,
        orders,
    };
}

function translateAuthErrorMessage(
    message: string | undefined,
    fallback: string,
): string {
    if (!message) return fallback;
    const lower = message.toLowerCase();
    if (
        lower.includes("invalid email or password") ||
        lower.includes("invalid username or password")
    ) {
        return "Credenciales inválidas. Verifica tu usuario o contraseña.";
    }
    if (lower.includes("user already exists") || lower.includes("email")) {
        return "Este correo electrónico ya está registrado.";
    }
    if (
        lower.includes("username is already taken") ||
        lower.includes("username")
    ) {
        return "Este nombre de usuario ya está en uso.";
    }
    return message;
}

export async function syncSessionWithBackend(): Promise<Session | null> {
    const existingToken = getSessionSnapshot()?.token;
    try {
        const res = await apiRequest<{ data: Record<string, unknown> }>(
            "/api/users/me",
        );
        const session: Session = {
            user: mapBetterAuthUser(res.data),
            ...(existingToken ? { token: existingToken } : {}),
        };
        saveSession(session);
        return session;
    } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
            clearSession();
        }
        return null;
    }
}

export async function loginWithBetterAuth(
    draft: LoginDraft,
): Promise<AuthServiceResult> {
    const identifier = draft.identifier.trim();
    const isEmail = isEmailIdentifier(identifier);

    try {
        const response = isEmail
            ? await authClient.signIn.email({
                  email: identifier,
                  password: draft.password,
              })
            : await authClient.signIn.username({
                  username: identifier,
                  password: draft.password,
              });

        if (response.data?.user) {
            const token = (response.data as { token?: string }).token;
            if (token) {
                saveSession({
                    user: mapBetterAuthUser(
                        response.data.user as Record<string, unknown>,
                        isEmail ? { email: identifier } : { username: identifier },
                    ),
                    token,
                });
            }

            const synced = await syncSessionWithBackend();
            if (synced) return { session: synced };

            const session: Session = {
                user: mapBetterAuthUser(
                    response.data.user as Record<string, unknown>,
                    isEmail ? { email: identifier } : { username: identifier },
                ),
                ...(token ? { token } : {}),
            };
            saveSession(session);
            return { session };
        }

        return {
            error: translateAuthErrorMessage(
                response.error?.message,
                "Credenciales inválidas. Verifica tu usuario o contraseña.",
            ),
        };
    } catch {
        return {
            error: "No fue posible conectar con el servidor de autenticación. Verifica que el backend esté activo.",
        };
    }
}

export async function signUpWithBetterAuth(
    draft: SignUpDraft,
): Promise<AuthServiceResult> {
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const username = draft.username.trim();
    const email = draft.email.trim();
    const birthDate = draft.birthDate;

    try {
        const response = await authClient.signUp.email({
            email,
            password: draft.password,
            name: fullName,
            username,
            firstName,
            lastName,
            birthDate,
        });

        if (response.data?.user) {
            const token = (response.data as { token?: string }).token;
            if (token) {
                saveSession({
                    user: mapBetterAuthUser(
                        response.data.user as Record<string, unknown>,
                        {
                            name: fullName,
                            firstName,
                            lastName,
                            birthDate,
                            username,
                            email,
                        },
                    ),
                    token,
                });
            }

            const synced = await syncSessionWithBackend();
            if (synced) return { session: synced };

            const session: Session = {
                user: mapBetterAuthUser(
                    response.data.user as Record<string, unknown>,
                    {
                        name: fullName,
                        firstName,
                        lastName,
                        birthDate,
                        username,
                        email,
                    },
                ),
                ...(token ? { token } : {}),
            };
            saveSession(session);
            return { session };
        }

        return {
            error: translateAuthErrorMessage(
                response.error?.message,
                "No fue posible crear la cuenta. Verifica los datos ingresados.",
            ),
        };
    } catch {
        return {
            error: "No fue posible conectar con el servidor de autenticación. Verifica que el backend esté activo.",
        };
    }
}

export async function updateUserProfile(
    payload: UpdateProfilePayload,
): Promise<AuthServiceResult> {
    try {
        const res = await apiRequest<{ data: Record<string, unknown> }>(
            "/api/users/me",
            {
                method: "PATCH",
                body: JSON.stringify(payload),
            },
        );
        const session: Session = {
            user: mapBetterAuthUser(res.data),
        };
        saveSession(session);
        return { session };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { error: error.message };
        }
        return {
            error: "No fue posible actualizar tu perfil en este momento.",
        };
    }
}

export async function completeUserOnboarding(
    payload: CompleteOnboardingPayload,
): Promise<AuthServiceResult> {
    try {
        const res = await apiRequest<{ data: Record<string, unknown> }>(
            "/api/users/me/onboarding",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );
        const session: Session = {
            user: mapBetterAuthUser(res.data),
        };
        saveSession(session);
        return { session };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { error: error.message };
        }
        return {
            error: "No fue posible guardar tus preferencias iniciales.",
        };
    }
}

export async function addUserAddress(
    payload: CreateUserAddressPayload,
): Promise<{ address?: UserAddressRecord; error?: string }> {
    try {
        const res = await apiRequest<{ data: UserAddressRecord }>(
            "/api/users/me/addresses",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );
        await syncSessionWithBackend();
        return { address: res.data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { error: error.message };
        }
        return { error: "No fue posible guardar la dirección." };
    }
}

export async function removeUserAddress(
    addressId: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        await apiRequest(`/api/users/me/addresses/${encodeURIComponent(addressId)}`, {
            method: "DELETE",
        });
        await syncSessionWithBackend();
        return { ok: true };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { ok: false, error: error.message };
        }
        return { ok: false, error: "No fue posible eliminar la dirección." };
    }
}

export async function addUserPaymentMethod(
    payload: CreatePaymentMethodPayload,
): Promise<{ paymentMethod?: PaymentMethodRecord; error?: string }> {
    try {
        const res = await apiRequest<{ data: PaymentMethodRecord }>(
            "/api/users/me/payment-methods",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );
        await syncSessionWithBackend();
        return { paymentMethod: res.data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { error: error.message };
        }
        return { error: "No fue posible guardar el método de pago." };
    }
}

export async function removeUserPaymentMethod(
    paymentMethodId: string,
): Promise<{ ok: boolean; error?: string }> {
    try {
        await apiRequest(
            `/api/users/me/payment-methods/${encodeURIComponent(paymentMethodId)}`,
            {
                method: "DELETE",
            },
        );
        await syncSessionWithBackend();
        return { ok: true };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { ok: false, error: error.message };
        }
        return {
            ok: false,
            error: "No fue posible eliminar el método de pago.",
        };
    }
}

export async function createCustomerOrder(
    payload: CreateOrderPayload,
): Promise<{ order?: OrderRecord; error?: string }> {
    try {
        const res = await apiRequest<{ data: OrderRecord }>("/api/orders", {
            method: "POST",
            body: JSON.stringify(payload),
        });
        await syncSessionWithBackend();
        return { order: res.data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { error: error.message };
        }
        return {
            error: "No fue posible registrar tu pedido en este momento.",
        };
    }
}

export async function signOutWithBetterAuth(): Promise<void> {
    try {
        await authClient.signOut();
    } catch {
        // Clear local snapshot even if the network request fails.
    }
    clearSession();
}

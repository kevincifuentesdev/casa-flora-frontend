import {
    ApiClientError,
    apiRequest,
} from "@/features/common/services/apiClient";
import { isEmailIdentifier } from "../domain/authValidation";
import type {
    LoginDraft,
    Session,
    SessionUser,
    SignUpDraft,
} from "../domain/session";
import { authClient } from "./authClient";
import { clearSession, saveSession } from "./sessionService";

export interface AuthServiceResult {
    session?: Session;
    error?: string;
}

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    username?: string;
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
    };
}

function translateAuthErrorMessage(
    message: string | undefined,
    fallback: string,
): string {
    if (!message) return fallback;
    const lower = message.toLowerCase();
    if (lower.includes("invalid email or password") || lower.includes("invalid username or password")) {
        return "Credenciales inválidas. Verifica tu usuario o contraseña.";
    }
    if (lower.includes("user already exists") || lower.includes("email")) {
        return "Este correo electrónico ya está registrado.";
    }
    if (lower.includes("username is already taken") || lower.includes("username")) {
        return "Este nombre de usuario ya está en uso.";
    }
    return message;
}

export async function syncSessionWithBackend(): Promise<Session | null> {
    try {
        const res = await apiRequest<{ data: Record<string, unknown> }>(
            "/api/users/me",
        );
        const session: Session = {
            user: mapBetterAuthUser(res.data),
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
            const synced = await syncSessionWithBackend();
            if (synced) return { session: synced };

            const session: Session = {
                user: mapBetterAuthUser(
                    response.data.user as Record<string, unknown>,
                    isEmail ? { email: identifier } : { username: identifier },
                ),
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

export async function signOutWithBetterAuth(): Promise<void> {
    try {
        await authClient.signOut();
    } catch {
        // Clear local snapshot even if the network request fails.
    }
    clearSession();
}

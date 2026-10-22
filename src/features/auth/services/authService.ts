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

interface StoredAccount extends SessionUser {
    password: string;
}

const ACCOUNTS_STORAGE_KEY = "casa-flora-accounts";

function readStoredAccounts(): StoredAccount[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    } catch {
        return [];
    }
}

function writeStoredAccounts(accounts: StoredAccount[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function isBackendUnavailable(status?: number): boolean {
    return status === undefined || status === 0 || status === 404 || status >= 502;
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
            const session: Session = {
                user: mapBetterAuthUser(
                    response.data.user as Record<string, unknown>,
                    isEmail ? { email: identifier } : { username: identifier },
                ),
            };
            saveSession(session);
            return { session };
        }

        if (response.error && !isBackendUnavailable(response.error.status)) {
            return {
                error:
                    response.error.message ||
                    "Credenciales inválidas. Verifica tu usuario o contraseña.",
            };
        }
    } catch {
        // Fallback to local session store when backend API is not reachable
    }

    const accounts = readStoredAccounts();
    const normalized = identifier.toLowerCase();
    const matched = accounts.find((acc) =>
        isEmail
            ? acc.email.toLowerCase() === normalized
            : acc.username.toLowerCase() === normalized,
    );

    if (!matched || matched.password !== draft.password) {
        return {
            error: "Credenciales inválidas. Verifica tu usuario/correo y contraseña.",
        };
    }

    const { password: _discarded, ...user } = matched;
    void _discarded;
    const session: Session = { user };
    saveSession(session);
    return { session };
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

        if (response.error && !isBackendUnavailable(response.error.status)) {
            return {
                error:
                    response.error.message ||
                    "No fue posible crear la cuenta. Verifica los datos ingresados.",
            };
        }
    } catch {
        // Fallback to local session store when backend API is not reachable
    }

    const accounts = readStoredAccounts();
    const emailTaken = accounts.some(
        (acc) => acc.email.toLowerCase() === email.toLowerCase(),
    );
    if (emailTaken) {
        return {
            error: "Este correo electrónico ya está registrado.",
        };
    }

    const usernameTaken = accounts.some(
        (acc) => acc.username.toLowerCase() === username.toLowerCase(),
    );
    if (usernameTaken) {
        return {
            error: "Este nombre de usuario ya está en uso.",
        };
    }

    const user: SessionUser = {
        id: crypto.randomUUID(),
        name: fullName,
        firstName,
        lastName,
        birthDate,
        username,
        email,
    };

    writeStoredAccounts([...accounts, { ...user, password: draft.password }]);
    const session: Session = { user };
    saveSession(session);
    return { session };
}

export async function signOutWithBetterAuth(): Promise<void> {
    try {
        await authClient.signOut();
    } catch {
        // Ignore network errors when backend is not connected
    }
    clearSession();
}


import type {
    LoginDraft,
    LoginErrors,
    LoginField,
    SignUpDraft,
    SignUpErrors,
    SignUpField,
} from "./session";

export const LOGIN_FIELD_ORDER: LoginField[] = ["identifier", "password"];

export const SIGNUP_FIELD_ORDER: SignUpField[] = [
    "firstName",
    "lastName",
    "birthDate",
    "username",
    "email",
    "password",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

export function isEmailIdentifier(identifier: string): boolean {
    return identifier.trim().includes("@");
}

export function validateLoginField(
    field: LoginField,
    draft: LoginDraft,
): string | null {
    const value = draft[field].trim();

    if (field === "identifier") {
        if (!value) {
            return "Ingresa tu nombre de usuario o correo electrónico.";
        }
        if (isEmailIdentifier(value) && !EMAIL_REGEX.test(value)) {
            return "Ingresa un correo electrónico válido.";
        }
        if (!isEmailIdentifier(value) && value.length < 3) {
            return "El nombre de usuario debe tener al menos 3 caracteres.";
        }
        return null;
    }

    if (field === "password") {
        if (!draft.password) {
            return "Ingresa tu contraseña.";
        }
        return null;
    }

    return null;
}

export function validateLoginDraft(draft: LoginDraft): LoginErrors {
    const errors: LoginErrors = {};

    for (const field of LOGIN_FIELD_ORDER) {
        const message = validateLoginField(field, draft);
        if (message) {
            errors[field] = message;
        }
    }

    return errors;
}

export function validateSignUpField(
    field: SignUpField,
    draft: SignUpDraft,
): string | null {
    const value = draft[field].trim();

    switch (field) {
        case "firstName":
            if (!value) return "Ingresa tus nombres.";
            if (value.length < 2) {
                return "Los nombres deben tener al menos 2 caracteres.";
            }
            return null;

        case "lastName":
            if (!value) return "Ingresa tus apellidos.";
            if (value.length < 2) {
                return "Los apellidos deben tener al menos 2 caracteres.";
            }
            return null;

        case "birthDate": {
            if (!value) return "Selecciona tu fecha de nacimiento.";
            const parsed = new Date(`${value}T00:00:00`);
            if (Number.isNaN(parsed.getTime())) {
                return "Ingresa una fecha de nacimiento válida.";
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (parsed >= today) {
                return "La fecha de nacimiento debe ser anterior a hoy.";
            }
            return null;
        }

        case "username":
            if (!value) return "Ingresa un nombre de usuario.";
            if (!USERNAME_REGEX.test(value)) {
                return "Usa entre 3 y 30 caracteres (letras, números, puntos o guiones).";
            }
            return null;

        case "email":
            if (!value) return "Ingresa tu correo electrónico.";
            if (!EMAIL_REGEX.test(value)) {
                return "Ingresa un correo electrónico válido.";
            }
            return null;

        case "password":
            if (!draft.password) return "Ingresa una contraseña.";
            if (draft.password.length < 8) {
                return "La contraseña debe tener al menos 8 caracteres.";
            }
            return null;
    }
}

export function validateSignUpDraft(draft: SignUpDraft): SignUpErrors {
    const errors: SignUpErrors = {};

    for (const field of SIGNUP_FIELD_ORDER) {
        const message = validateSignUpField(field, draft);
        if (message) {
            errors[field] = message;
        }
    }

    return errors;
}

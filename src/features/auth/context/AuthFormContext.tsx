"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    validateLoginDraft,
    validateSignUpDraft,
} from "../domain/authValidation";
import type {
    AuthMode,
    LoginDraft,
    LoginErrors,
    LoginField,
    SignUpDraft,
    SignUpErrors,
    SignUpField,
} from "../domain/session";
import {
    loginWithBetterAuth,
    signUpWithBetterAuth,
} from "../services/authService";

export interface AuthFormContextValue {
    mode: AuthMode;
    loginDraft: LoginDraft;
    signUpDraft: SignUpDraft;
    loginErrors: LoginErrors;
    signUpErrors: SignUpErrors;
    formError: string | null;
    errorVersion: number;
    isSubmitting: boolean;
    setMode: (mode: AuthMode) => void;
    updateLoginField: (field: LoginField, value: string) => void;
    updateSignUpField: (field: SignUpField, value: string) => void;
    submitLogin: () => Promise<boolean>;
    submitSignUp: () => Promise<boolean>;
}

const AuthFormContext = createContext<AuthFormContextValue | null>(null);

const initialLoginDraft: LoginDraft = {
    identifier: "",
    password: "",
};

const initialSignUpDraft: SignUpDraft = {
    firstName: "",
    lastName: "",
    birthDate: "",
    username: "",
    email: "",
    password: "",
};

export function AuthFormProvider({
    initialMode = "login",
    children,
}: {
    initialMode?: AuthMode;
    children: ReactNode;
}) {
    const [mode, setModeState] = useState<AuthMode>(initialMode);
    const [loginDraft, setLoginDraft] = useState<LoginDraft>(initialLoginDraft);
    const [signUpDraft, setSignUpDraft] =
        useState<SignUpDraft>(initialSignUpDraft);
    const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
    const [signUpErrors, setSignUpErrors] = useState<SignUpErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [errorVersion, setErrorVersion] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setMode = useCallback((nextMode: AuthMode) => {
        setModeState(nextMode);
        setLoginErrors({});
        setSignUpErrors({});
        setFormError(null);
    }, []);

    const updateLoginField = useCallback(
        (field: LoginField, value: string) => {
            setLoginDraft((prev) => ({ ...prev, [field]: value }));
            setFormError(null);
            setLoginErrors((prev) => {
                if (!prev[field]) return prev;
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        [],
    );

    const updateSignUpField = useCallback(
        (field: SignUpField, value: string) => {
            setSignUpDraft((prev) => ({ ...prev, [field]: value }));
            setFormError(null);
            setSignUpErrors((prev) => {
                if (!prev[field]) return prev;
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        [],
    );

    const submitLogin = useCallback(async () => {
        setFormError(null);
        const errors = validateLoginDraft(loginDraft);

        if (Object.keys(errors).length > 0) {
            setLoginErrors(errors);
            setErrorVersion((v) => v + 1);
            return false;
        }

        setIsSubmitting(true);
        try {
            const result = await loginWithBetterAuth(loginDraft);
            if (result.error) {
                setFormError(result.error);
                return false;
            }
            setLoginErrors({});
            return true;
        } finally {
            setIsSubmitting(false);
        }
    }, [loginDraft]);

    const submitSignUp = useCallback(async () => {
        setFormError(null);
        const errors = validateSignUpDraft(signUpDraft);

        if (Object.keys(errors).length > 0) {
            setSignUpErrors(errors);
            setErrorVersion((v) => v + 1);
            return false;
        }

        setIsSubmitting(true);
        try {
            const result = await signUpWithBetterAuth(signUpDraft);
            if (result.error) {
                setFormError(result.error);
                return false;
            }
            setSignUpErrors({});
            return true;
        } finally {
            setIsSubmitting(false);
        }
    }, [signUpDraft]);

    const value = useMemo<AuthFormContextValue>(
        () => ({
            mode,
            loginDraft,
            signUpDraft,
            loginErrors,
            signUpErrors,
            formError,
            errorVersion,
            isSubmitting,
            setMode,
            updateLoginField,
            updateSignUpField,
            submitLogin,
            submitSignUp,
        }),
        [
            mode,
            loginDraft,
            signUpDraft,
            loginErrors,
            signUpErrors,
            formError,
            errorVersion,
            isSubmitting,
            setMode,
            updateLoginField,
            updateSignUpField,
            submitLogin,
            submitSignUp,
        ],
    );

    return <AuthFormContext value={value}>{children}</AuthFormContext>;
}

export function useAuthFormContext() {
    const context = useContext(AuthFormContext);
    if (!context) {
        throw new Error(
            "useAuthFormContext must be used within an AuthFormProvider",
        );
    }
    return context;
}


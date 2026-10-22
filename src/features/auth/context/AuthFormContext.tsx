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


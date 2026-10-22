"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useAuthFormContext } from "../context/AuthFormContext";
import {
    LOGIN_FIELD_ORDER,
    SIGNUP_FIELD_ORDER,
} from "../domain/authValidation";

export function useAuthForm() {
    const router = useRouter();
    const ctx = useAuthFormContext();
    const {
        mode,
        loginErrors,
        signUpErrors,
        errorVersion,
        submitLogin,
        submitSignUp,
    } = ctx;

    useEffect(() => {
        if (errorVersion === 0) return;

        const firstField =
            mode === "login"
                ? LOGIN_FIELD_ORDER.find((field) => loginErrors[field])
                : SIGNUP_FIELD_ORDER.find((field) => signUpErrors[field]);

        if (!firstField) return;

        document
            .querySelector<HTMLElement>(`[data-auth-field="${firstField}"]`)
            ?.focus({ preventScroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorVersion]);

    const handleSubmit = useCallback(async () => {
        const success =
            mode === "login" ? await submitLogin() : await submitSignUp();
        if (success) {
            router.push("/");
        }
    }, [mode, router, submitLogin, submitSignUp]);

    return {
        ...ctx,
        handleSubmit,
    };
}


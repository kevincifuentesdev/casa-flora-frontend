"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeSlash } from "reicon-react";

import Button from "@/features/common/components/Button";
import { useAuthForm } from "../hooks/useAuthForm";
import { AuthFieldError, authFieldErrorClasses } from "./AuthFieldError";

const labelClass =
    "mb-2 block font-body text-sm/5 font-bold tracking-[0.03em] text-foreground";

const inputBaseClass =
    "w-full rounded-lg border border-border bg-background-alt/60 px-4 py-3 font-body text-base/6 text-foreground outline-none transition placeholder:text-foreground-muted/70 focus:border-primary focus:bg-surface focus:shadow-[0_0_0_3px_rgb(75_3_15/8%)] dark:focus:shadow-[0_0_0_3px_rgb(138_31_45/20%)]";

export default function LoginForm() {
    const {
        loginDraft,
        loginErrors,
        formError,
        isSubmitting,
        updateLoginField,
        setMode,
        handleSubmit,
    } = useAuthForm();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <form
            id="login-form"
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
            }}
            className="flex flex-col gap-5"
        >
            {formError && (
                <div
                    role="alert"
                    className="animate-error-in rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-semibold text-destructive"
                >
                    {formError}
                </div>
            )}

            <div>
                <label htmlFor="login-identifier" className={labelClass}>
                    Nombre de usuario o correo electrónico
                </label>
                <input
                    id="login-identifier"
                    name="identifier"
                    type="text"
                    data-auth-field="identifier"
                    autoComplete="username"
                    placeholder="ej. usuario o correo@ejemplo.com"
                    value={loginDraft.identifier}
                    aria-invalid={Boolean(loginErrors.identifier)}
                    aria-describedby={
                        loginErrors.identifier
                            ? "login-identifier-error"
                            : undefined
                    }
                    onChange={(e) =>
                        updateLoginField("identifier", e.target.value)
                    }
                    className={`${inputBaseClass} ${
                        loginErrors.identifier ? authFieldErrorClasses : ""
                    }`}
                />
                <AuthFieldError
                    id="login-identifier-error"
                    message={loginErrors.identifier}
                />
            </div>

            <div>
                <label htmlFor="login-password" className={labelClass}>
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        data-auth-field="password"
                        autoComplete="current-password"
                        placeholder="Ingresa tu contraseña"
                        value={loginDraft.password}
                        aria-invalid={Boolean(loginErrors.password)}
                        aria-describedby={
                            loginErrors.password
                                ? "login-password-error"
                                : undefined
                        }
                        onChange={(e) =>
                            updateLoginField("password", e.target.value)
                        }
                        className={`${inputBaseClass} pr-12 ${
                            loginErrors.password ? authFieldErrorClasses : ""
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                            showPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                        }
                        className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-foreground-muted transition hover:text-primary"
                    >
                        {showPassword ? (
                            <EyeSlash className="size-5" aria-hidden="true" />
                        ) : (
                            <Eye className="size-5" aria-hidden="true" />
                        )}
                    </button>
                </div>
                <AuthFieldError
                    id="login-password-error"
                    message={loginErrors.password}
                />
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    variant="default"
                    disabled={isSubmitting}
                    className="w-full gap-2 rounded-lg! px-6! py-3.5! text-sm/5 font-bold tracking-[0.04em] shadow-(--shadow-ambient-sm) hover:opacity-90 active:scale-[0.98]"
                >
                    <span>
                        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                    </span>
                    <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
                </Button>
            </div>

            <p className="m-0 border-t border-foreground-muted/15 pt-4 text-center font-body text-sm text-foreground-muted dark:border-foreground-muted/10">
                ¿Aún no eres parte de Casa Flora?{" "}
                <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="cursor-pointer border-0 bg-transparent p-0 font-bold text-primary underline-offset-4 hover:underline"
                >
                    Crea tu cuenta
                </button>
            </p>
        </form>
    );
}


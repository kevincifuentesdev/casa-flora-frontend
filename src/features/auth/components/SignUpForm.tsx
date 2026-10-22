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

export default function SignUpForm() {
    const {
        signUpDraft,
        signUpErrors,
        formError,
        isSubmitting,
        updateSignUpField,
        setMode,
        handleSubmit,
    } = useAuthForm();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <form
            id="signup-form"
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

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                <div>
                    <label htmlFor="signup-firstName" className={labelClass}>
                        Nombres
                    </label>
                    <input
                        id="signup-firstName"
                        name="firstName"
                        type="text"
                        data-auth-field="firstName"
                        autoComplete="given-name"
                        placeholder="ej. María Fernanda"
                        value={signUpDraft.firstName}
                        aria-invalid={Boolean(signUpErrors.firstName)}
                        aria-describedby={
                            signUpErrors.firstName
                                ? "signup-firstName-error"
                                : undefined
                        }
                        onChange={(e) =>
                            updateSignUpField("firstName", e.target.value)
                        }
                        className={`${inputBaseClass} ${
                            signUpErrors.firstName ? authFieldErrorClasses : ""
                        }`}
                    />
                    <AuthFieldError
                        id="signup-firstName-error"
                        message={signUpErrors.firstName}
                    />
                </div>

                <div>
                    <label htmlFor="signup-lastName" className={labelClass}>
                        Apellidos
                    </label>
                    <input
                        id="signup-lastName"
                        name="lastName"
                        type="text"
                        data-auth-field="lastName"
                        autoComplete="family-name"
                        placeholder="ej. Restrepo Gómez"
                        value={signUpDraft.lastName}
                        aria-invalid={Boolean(signUpErrors.lastName)}
                        aria-describedby={
                            signUpErrors.lastName
                                ? "signup-lastName-error"
                                : undefined
                        }
                        onChange={(e) =>
                            updateSignUpField("lastName", e.target.value)
                        }
                        className={`${inputBaseClass} ${
                            signUpErrors.lastName ? authFieldErrorClasses : ""
                        }`}
                    />
                    <AuthFieldError
                        id="signup-lastName-error"
                        message={signUpErrors.lastName}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                <div>
                    <label htmlFor="signup-birthDate" className={labelClass}>
                        Fecha de nacimiento
                    </label>
                    <input
                        id="signup-birthDate"
                        name="birthDate"
                        type="date"
                        data-auth-field="birthDate"
                        autoComplete="bday"
                        value={signUpDraft.birthDate}
                        aria-invalid={Boolean(signUpErrors.birthDate)}
                        aria-describedby={
                            signUpErrors.birthDate
                                ? "signup-birthDate-error"
                                : undefined
                        }
                        onChange={(e) =>
                            updateSignUpField("birthDate", e.target.value)
                        }
                        className={`${inputBaseClass} ${
                            signUpErrors.birthDate ? authFieldErrorClasses : ""
                        }`}
                    />
                    <AuthFieldError
                        id="signup-birthDate-error"
                        message={signUpErrors.birthDate}
                    />
                </div>

                <div>
                    <label htmlFor="signup-username" className={labelClass}>
                        Nombre de usuario
                    </label>
                    <input
                        id="signup-username"
                        name="username"
                        type="text"
                        data-auth-field="username"
                        autoComplete="username"
                        placeholder="ej. mrestrepo"
                        value={signUpDraft.username}
                        aria-invalid={Boolean(signUpErrors.username)}
                        aria-describedby={
                            signUpErrors.username
                                ? "signup-username-error"
                                : undefined
                        }
                        onChange={(e) =>
                            updateSignUpField("username", e.target.value)
                        }
                        className={`${inputBaseClass} ${
                            signUpErrors.username ? authFieldErrorClasses : ""
                        }`}
                    />
                    <AuthFieldError
                        id="signup-username-error"
                        message={signUpErrors.username}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="signup-email" className={labelClass}>
                    Correo Electrónico
                </label>
                <input
                    id="signup-email"
                    name="email"
                    type="email"
                    data-auth-field="email"
                    autoComplete="email"
                    placeholder="ej. maria@ejemplo.com"
                    value={signUpDraft.email}
                    aria-invalid={Boolean(signUpErrors.email)}
                    aria-describedby={
                        signUpErrors.email ? "signup-email-error" : undefined
                    }
                    onChange={(e) => updateSignUpField("email", e.target.value)}
                    className={`${inputBaseClass} ${
                        signUpErrors.email ? authFieldErrorClasses : ""
                    }`}
                />
                <AuthFieldError
                    id="signup-email-error"
                    message={signUpErrors.email}
                />
            </div>

            <div>
                <label htmlFor="signup-password" className={labelClass}>
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        data-auth-field="password"
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        value={signUpDraft.password}
                        aria-invalid={Boolean(signUpErrors.password)}
                        aria-describedby={
                            signUpErrors.password
                                ? "signup-password-error"
                                : undefined
                        }
                        onChange={(e) =>
                            updateSignUpField("password", e.target.value)
                        }
                        className={`${inputBaseClass} pr-12 ${
                            signUpErrors.password ? authFieldErrorClasses : ""
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
                    id="signup-password-error"
                    message={signUpErrors.password}
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
                        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                    </span>
                    <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
                </Button>
            </div>

            <p className="m-0 border-t border-foreground-muted/15 pt-4 text-center font-body text-sm text-foreground-muted dark:border-foreground-muted/10">
                ¿Ya tienes una cuenta?{" "}
                <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="cursor-pointer border-0 bg-transparent p-0 font-bold text-primary underline-offset-4 hover:underline"
                >
                    Inicia sesión
                </button>
            </p>
        </form>
    );
}


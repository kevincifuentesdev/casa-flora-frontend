"use client";

import { AuthFormProvider, useAuthFormContext } from "../context/AuthFormContext";
import type { AuthMode } from "../domain/session";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

function AuthCardContent() {
    const { mode, setMode } = useAuthFormContext();

    return (
        <div className="mx-auto flex w-full max-w-(--container-max) flex-col items-center px-(--spacing-margin-mobile) py-10 pb-20 md:px-(--spacing-margin-desktop) md:py-16 md:pb-24">
            <div className="mb-8 max-w-xl text-center">
                <h1 className="m-0 mb-3 font-display text-[2.5rem]/10 text-primary md:text-5xl md:leading-14">
                    {mode === "login"
                        ? "Bienvenido de nuevo"
                        : "Sé parte de Casa Flora"}
                </h1>
                <p className="m-0 font-body text-base/6 text-foreground-muted md:text-lg/7">
                    {mode === "login"
                        ? "Ingresa a tu cuenta para gestionar tus pedidos y reservaciones."
                        : "Crea tu cuenta para disfrutar de nuestras recetas familiares y reservar tu mesa."}
                </p>
            </div>

            <div className="w-full max-w-xl rounded-xl border border-foreground-muted/15 bg-surface p-6 shadow-(--shadow-ambient-md) transition-colors duration-400 md:p-8 lg:p-10 dark:border-foreground-muted/10">
                <div
                    role="tablist"
                    aria-label="Opciones de acceso"
                    className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-foreground-muted/15 bg-background-alt p-1 dark:border-foreground-muted/10"
                >
                    <button
                        type="button"
                        role="tab"
                        id="tab-login"
                        aria-selected={mode === "login"}
                        aria-controls="panel-auth"
                        onClick={() => setMode("login")}
                        className={`cursor-pointer rounded-md border-0 py-2.5 font-body text-sm/5 transition duration-200 ${
                            mode === "login"
                                ? "bg-surface font-bold text-primary shadow-(--shadow-ambient-sm)"
                                : "bg-transparent font-semibold text-foreground-muted hover:text-foreground"
                        }`}
                    >
                        Iniciar sesión
                    </button>

                    <button
                        type="button"
                        role="tab"
                        id="tab-signup"
                        aria-selected={mode === "signup"}
                        aria-controls="panel-auth"
                        onClick={() => setMode("signup")}
                        className={`cursor-pointer rounded-md border-0 py-2.5 font-body text-sm/5 transition duration-200 ${
                            mode === "signup"
                                ? "bg-surface font-bold text-primary shadow-(--shadow-ambient-sm)"
                                : "bg-transparent font-semibold text-foreground-muted hover:text-foreground"
                        }`}
                    >
                        Crear cuenta
                    </button>
                </div>

                <div
                    id="panel-auth"
                    role="tabpanel"
                    aria-labelledby={mode === "login" ? "tab-login" : "tab-signup"}
                >
                    {mode === "login" ? <LoginForm /> : <SignUpForm />}
                </div>
            </div>
        </div>
    );
}

export default function AuthFormSection({
    initialMode = "login",
}: {
    initialMode?: AuthMode;
}) {
    return (
        <AuthFormProvider initialMode={initialMode}>
            <AuthCardContent />
        </AuthFormProvider>
    );
}


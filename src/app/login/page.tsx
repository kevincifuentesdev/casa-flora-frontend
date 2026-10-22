import type { Metadata } from "next";

import AuthFormSection from "@/features/auth/components/AuthFormSection";

export const metadata: Metadata = {
    title: "Casa Flora — Iniciar sesión",
    description:
        "Inicia sesión o crea tu cuenta en Casa Flora para gestionar tus pedidos y reservaciones.",
};

export default function LoginPage() {
    return <AuthFormSection initialMode="login" />;
}


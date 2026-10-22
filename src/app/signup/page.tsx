import type { Metadata } from "next";

import AuthFormSection from "@/features/auth/components/AuthFormSection";

export const metadata: Metadata = {
    title: "Casa Flora — Crear cuenta",
    description:
        "Regístrate en Casa Flora para disfrutar de nuestras recetas familiares y reservar tu mesa.",
};

export default function SignUpPage() {
    return <AuthFormSection initialMode="signup" />;
}


import type { Metadata } from "next";

import TermsConditionsPage from "@/features/legal/components/TermsConditionsPage";

export const metadata: Metadata = {
    title: "Casa Flora | Términos y Condiciones",
    description:
        "Términos y condiciones de uso de Casa Flora. Información sobre compras en línea, reservas de mesa, entregas a domicilio y políticas del restaurante en Medellín.",
};

export default function Page() {
    return <TermsConditionsPage />;
}


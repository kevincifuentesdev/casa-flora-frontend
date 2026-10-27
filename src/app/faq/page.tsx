import type { Metadata } from "next";

import FaqPage from "@/features/faq/components/FaqPage";

export const metadata: Metadata = {
    title: "Casa Flora | Preguntas Frecuentes",
    description:
        "Respuestas a las preguntas más comunes sobre pedidos a domicilio, reservas de mesa, medios de pago y el programa de puntos de Casa Flora.",
};

export default function Page() {
    return <FaqPage />;
}

import type { Metadata } from "next";

import AboutUsPage from "@/features/about/components/AboutUsPage";

export const metadata: Metadata = {
    title: "Casa Flora | Sobre Nosotros",
    description:
        "Conoce la historia, valores y tradición culinaria de Casa Flora. Cocina artesanal, ingredientes locales y amor de hogar en Medellín.",
};

export default function Page() {
    return <AboutUsPage />;
}

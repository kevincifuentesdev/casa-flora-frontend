import type { Metadata } from "next";

import MenuPage from "@/features/menu/components/MenuPage";

export const metadata: Metadata = {
    title: "Casa Flora — Menú",
    description:
        "Descubre el menú completo de Casa Flora. Entradas, platos fuertes, postres, bebidas y opciones veganas con sabores de la tradición colombiana.",
};

export default function Page() {
    return <MenuPage />;
}

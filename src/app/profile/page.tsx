import type { Metadata } from "next";

import { ProfilePage } from "@/features/profile/components/ProfilePage";

export const metadata: Metadata = {
    title: "Casa Flora | Mi Perfil",
    description:
        "Consulta tus datos personales y administra tus reservas de mesa en Casa Flora.",
};

export default function ProfileRoute() {
    return <ProfilePage />;
}


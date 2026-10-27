import type { Metadata } from "next";

import AdminDashboardPage from "@/features/admin/components/AdminDashboardPage";

export const metadata: Metadata = {
    title: "Administración | Casa Flora",
    description:
        "Panel operativo exclusivo para administradores de Casa Flora: gestión de pedidos, reservas de mesa y catálogo gastronómico.",
};

export default function AdminPage() {
    return <AdminDashboardPage />;
}


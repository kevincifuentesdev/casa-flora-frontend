import type { Metadata } from "next";

import BookingSection from "@/features/booking/components/BookingSection";

export const metadata: Metadata = {
    title: "Casa Flora — Reservas",
    description:
        "Reserva tu mesa en Casa Flora. Elige ambiente, fecha, horario y número de comensales para disfrutar de la tradición colombiana.",
};

export default function BookingPage() {
    return <BookingSection />;
}

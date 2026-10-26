import type { Metadata } from "next";

import { OnboardingOverlay } from "@/features/onboarding/components/OnboardingOverlay";

export const metadata: Metadata = {
    title: "Casa Flora | Bienvenida",
    description:
        "Configura tu dirección, método de pago y preferencias culinarias en Casa Flora.",
};

export default function OnboardingRoute() {
    return <OnboardingOverlay />;
}


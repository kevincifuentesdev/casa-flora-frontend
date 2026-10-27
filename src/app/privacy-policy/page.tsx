import type { Metadata } from "next";

import PrivacyPolicyPage from "@/features/legal/components/PrivacyPolicyPage";

export const metadata: Metadata = {
    title: "Casa Flora | Política de Privacidad",
    description:
        "Política de privacidad y tratamiento de datos personales de Casa Flora (Habeas Data Ley 1581 de 2012). Conoce cómo protegemos tu información.",
};

export default function Page() {
    return <PrivacyPolicyPage />;
}

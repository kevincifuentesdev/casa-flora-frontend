import {
    inferAdditionalFields,
    usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { API_BASE_URL } from "@/features/common/services/apiClient";

export const authClient = createAuthClient({
    baseURL: API_BASE_URL,
    fetchOptions: { credentials: "include" },
    plugins: [
        usernameClient(),
        inferAdditionalFields({
            user: {
                firstName: {
                    type: "string",
                    required: true,
                },
                lastName: {
                    type: "string",
                    required: true,
                },
                birthDate: {
                    type: "string",
                    required: true,
                },
            },
        }),
    ],
});

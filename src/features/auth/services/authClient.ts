import {
    inferAdditionalFields,
    usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
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


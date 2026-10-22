export interface SessionUser {
    id: string;
    name: string;
    email: string;
}

export interface Session {
    user: SessionUser;
}

/** `undefined` while the session has not been read yet (SSR / hydration). */
export type SessionState = Session | null | undefined;

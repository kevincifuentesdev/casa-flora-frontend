"use client";

import { createContext, useCallback, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import type { Session, SessionState } from "../domain/session";
import { signOutWithBetterAuth } from "../services/authService";
import {
    getServerSessionSnapshot,
    getSessionSnapshot,
    saveSession,
    subscribeToSession,
} from "../services/sessionService";

export interface SessionContextValue {
    session: SessionState;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (session: Session) => void;
    logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const session = useSyncExternalStore(
        subscribeToSession,
        getSessionSnapshot,
        getServerSessionSnapshot,
    );

    const login = useCallback((next: Session) => saveSession(next), []);
    const logout = useCallback(() => signOutWithBetterAuth(), []);

    const value = useMemo<SessionContextValue>(
        () => ({
            session,
            isLoading: session === undefined,
            isAuthenticated: !!session,
            login,
            logout,
        }),
        [session, login, logout],
    );

    return <SessionContext value={value}>{children}</SessionContext>;
}

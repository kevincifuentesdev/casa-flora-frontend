"use client";

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { Session, SessionState } from "../domain/session";
import {
    signOutWithBetterAuth,
    syncSessionWithBackend,
} from "../services/authService";
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
    refreshSession: () => Promise<Session | null>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const session = useSyncExternalStore(
        subscribeToSession,
        getSessionSnapshot,
        getServerSessionSnapshot,
    );

    useEffect(() => {
        void syncSessionWithBackend();
    }, []);

    const login = useCallback((next: Session) => saveSession(next), []);
    const logout = useCallback(() => signOutWithBetterAuth(), []);
    const refreshSession = useCallback(() => syncSessionWithBackend(), []);

    const value = useMemo<SessionContextValue>(
        () => ({
            session,
            isLoading: session === undefined,
            isAuthenticated: !!session,
            login,
            logout,
            refreshSession,
        }),
        [session, login, logout, refreshSession],
    );

    return <SessionContext value={value}>{children}</SessionContext>;
}

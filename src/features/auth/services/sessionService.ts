import type { Session, SessionState } from "../domain/session";

const STORAGE_KEY = "casa-flora-session";

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

function emit() {
    listeners.forEach((listener) => listener());
}

export function subscribeToSession(listener: () => void) {
    listeners.add(listener);

    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
}

/** Client snapshot. Returns a stable reference while storage is unchanged. */
export function getSessionSnapshot(): SessionState {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSession;

    cachedRaw = raw;
    try {
        cachedSession = raw ? (JSON.parse(raw) as Session) : null;
    } catch {
        cachedSession = null;
    }
    return cachedSession;
}

export function getServerSessionSnapshot(): SessionState {
    return undefined;
}

// TODO: replace with calls to the backend auth endpoints.
export function saveSession(session: Session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    emit();
}

export function clearSession() {
    window.localStorage.removeItem(STORAGE_KEY);
    emit();
}

export interface SessionUser {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    username: string;
    email: string;
}

export interface Session {
    user: SessionUser;
}

export type SessionState = Session | null | undefined;

export type AuthMode = "login" | "signup";

export interface LoginDraft {
    identifier: string;
    password: string;
}

export interface SignUpDraft {
    firstName: string;
    lastName: string;
    birthDate: string;
    username: string;
    email: string;
    password: string;
}

export type LoginField = keyof LoginDraft;
export type SignUpField = keyof SignUpDraft;

export type LoginErrors = Partial<Record<LoginField, string>>;
export type SignUpErrors = Partial<Record<SignUpField, string>>;

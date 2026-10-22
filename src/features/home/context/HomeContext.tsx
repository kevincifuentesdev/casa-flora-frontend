"use client";

import { createContext, type ReactNode } from "react";
import type { HomeState } from "../domain/home";

export const HomeContext = createContext<HomeState | null>(null);

export function HomeProvider({
    value,
    children,
}: {
    value: HomeState;
    children: ReactNode;
}) {
    return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

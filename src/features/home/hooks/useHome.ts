"use client";

import { useContext } from "react";
import { HomeContext } from "../context/HomeContext";

export function useHome() {
    const context = useContext(HomeContext);
    if (!context) {
        throw new Error("useHome must be used within a HomeProvider");
    }
    return context;
}

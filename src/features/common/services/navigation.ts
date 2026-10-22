import { Calendar, ForkKnife, Home3 } from "reicon-react";

export type NavIcon =
    | typeof Home3
    | typeof ForkKnife
    | typeof Calendar;

export interface NavLink {
    label: string;
    href: string;
    icon: NavIcon;
}

export const navLinks: NavLink[] = [
    { label: "Inicio", href: "/", icon: Home3 },
    { label: "Menú", href: "/menu", icon: ForkKnife },
    { label: "Reserva", href: "/booking", icon: Calendar },
];
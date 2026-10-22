import { Calendar, ForkKnife, Home3, User } from "reicon-react";

export type NavIcon =
    | typeof Home3
    | typeof ForkKnife
    | typeof Calendar
    | typeof User;

export interface NavLink {
    label: string;
    href: string;
    icon: NavIcon;
}

export const navLinks: NavLink[] = [
    { label: "Inicio", href: "/", icon: Home3 },
    { label: "Menú", href: "/menu", icon: ForkKnife },
    { label: "Reserva", href: "/booking", icon: Calendar },
    { label: "Perfil", href: "/profile", icon: User },
];
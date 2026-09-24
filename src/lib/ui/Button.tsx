import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = 
    | "default"
    | "ghost"
    | "icon"
    | "outline"
    | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: ButtonVariant;
};

const baseClasses = "inline-flex items-center hover:opacity-[.8] justify-center cursor-pointer transition duration-200 active:scale-95"

const variantClasses: Record<ButtonVariant, string> = {
    default:
        "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground",

    ghost:
        "inline-flex items-center justify-center rounded-md bg-transparent px-4 py-2 text-primary hover:bg-black/5",

    icon:
         "inline-flex size-[clamp(2.5rem,4vw,3rem)] shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-primary [&>svg]:size-[clamp(1.25rem,2vw,1.5rem)]",

    destructive:
        "inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-destructive-foreground",

    outline:
        "inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-secondary-foreground",
};

export default function Button({
    children,
    variant = "default",
    className = "",
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button 
        type={type}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}>{children}</button>
    )
}
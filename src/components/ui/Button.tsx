"use client";

import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-lg font-medium transition-colors disabled:opacity-50",
        {
          "bg-harvest-600 text-white hover:bg-harvest-700": variant === "primary",
          "bg-citrus-500 text-white hover:bg-citrus-600": variant === "secondary",
          "border-2 border-harvest-600 text-harvest-700 hover:bg-harvest-50":
            variant === "outline",
          "text-harvest-700 hover:bg-harvest-100": variant === "ghost",
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

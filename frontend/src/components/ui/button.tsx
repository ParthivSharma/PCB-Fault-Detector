import React from "react";
import { cn } from "@/lib/utils"; // Combine classes safely

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium";
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 text-gray-800",
      destructive: "bg-red-600 text-white hover:bg-red-700"
    };
    const sizes = {
      sm: "px-2 py-1 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

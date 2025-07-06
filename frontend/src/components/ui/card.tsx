import React from "react";
import { cn } from "@/lib/utils"; // Ensure you have this utility

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn("rounded-lg border bg-white shadow-md", className)}>{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-2", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h2 className={cn("text-lg font-bold", className)}>{children}</h2>;
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn("text-sm text-gray-600", className)}>{children}</p>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

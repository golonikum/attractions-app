import React from "react";

interface TagProps {
  text: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
  onClick?: (e: any) => void;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Tag({
  text,
  variant = "default",
  className = "",
  onClick,
}: TagProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-block px-2 py-1 text-xs rounded-full ${variantStyles[variant]} ${className}`}
    >
      {text}
    </span>
  );
}

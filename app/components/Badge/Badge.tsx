import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant: "primary" | "success" | "danger" | "warning" | "info" | "secondary";
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  primary: { bg: "#007bff", text: "#fff" },
  success: { bg: "#28a745", text: "#fff" },
  danger: { bg: "#dc3545", text: "#fff" },
  warning: { bg: "#ffc107", text: "#fff" },
  info: { bg: "#17a2b8", text: "#fff" },
  secondary: { bg: "#6c757d", text: "#fff" }
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "primary", className }) => {
  const getVariantStyles = (variant: string | undefined) => {
    if (!variant) return;

    const style = variantStyles[variant];
    if (!style) return;

    return `bg-[${style.bg}] text-[${style.text}]`;
  };

  return (
    <span
      className={`inline-block px-2.5 py-1.5 text-xs font-semibold leading-none text-center whitespace-nowrap rounded-md
        ${getVariantStyles(variant)}
        ${className}`}
    >
      {children}
    </span>
  );
};

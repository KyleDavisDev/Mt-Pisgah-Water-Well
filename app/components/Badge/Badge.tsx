import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant: "primary" | "success" | "danger" | "warning" | "info" | "secondary";
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  primary: { bg: "#007bff", text: "#ffffff" },
  success: { bg: "#28a745", text: "#ffffff" },
  danger: { bg: "#dc3545", text: "#ffffff" },
  warning: { bg: "#ffc107", text: "#ffffff" },
  info: { bg: "#17a2b8", text: "#ffffff" },
  secondary: { bg: "#6c757d", text: "#ffffff" }
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "primary", className }) => {
  const getVariantStyles = (variant: string | undefined) => {
    if (!variant) return;

    const style = variantStyles[variant];
    if (!style) return;

    return { backgroundColor: style.bg, color: style.text };
  };

  return (
    <span
      className={`inline-block px-2.5 py-1.5 text-xs font-semibold leading-none text-center whitespace-nowrap rounded-md
        ${className ? className : ""}`}
      style={getVariantStyles(variant)}
    >
      {children}
    </span>
  );
};

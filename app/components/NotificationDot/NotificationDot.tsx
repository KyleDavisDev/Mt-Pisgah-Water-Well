import React from "react";

export interface NotificationDotProps {
  variant?: "primary" | "success" | "danger" | "warning" | "info" | "secondary";
  className?: string;
  size?: number; // in px
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  primary: { bg: "#007bff", text: "#ffffff" },
  success: { bg: "#28a745", text: "#ffffff" },
  danger: { bg: "#dc3545", text: "#ffffff" },
  warning: { bg: "#ffc107", text: "#ffffff" },
  info: { bg: "#17a2b8", text: "#ffffff" },
  secondary: { bg: "#6c757d", text: "#ffffff" }
};

export const NotificationDot: React.FC<NotificationDotProps> = props => {
  const getVariantStyles = (props: NotificationDotProps) => {
    const { variant } = props;
    if (!variant) return { backgroundColor: variantStyles["primary"].bg };

    return { backgroundColor: variantStyles[variant].bg };
  };

  return (
    <span
      className={`inline-block rounded-[50%] mr-[8px] w-[10px] h-[10px] ${props.className ?? ""}`}
      style={getVariantStyles(props)}
    />
  );
};

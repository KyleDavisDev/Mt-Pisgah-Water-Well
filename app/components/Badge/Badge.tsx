import React from "react";
import styled from "styled-components";

export interface BadgeProps {
  children: React.ReactNode;
  variant: "primary" | "success" | "danger" | "warning" | "info" | "secondary";
  color?: string; // Custom background color (overrides variant)
  textColor?: string; // Custom text color (overrides variant)
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

const StyledBadge = styled.span<BadgeProps>`
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  border-radius: 0.375rem;
  background-color: ${props => props.color || variantStyles[props.variant].bg};
  color: ${props => props.textColor || variantStyles[props.variant].text};
`;

export const Badge: React.FC<BadgeProps> = ({ children, variant = "primary", color, textColor, className }) => {
  return (
    <StyledBadge variant={variant} color={color} textColor={textColor} className={className}>
      {children}
    </StyledBadge>
  );
};

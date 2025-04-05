import React from "react";
import styled from "styled-components";

export interface NotificationDotProps {
  variant?: "primary" | "success" | "danger" | "warning" | "info" | "secondary";
  className?: string;
  size?: number; // in px
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const variantColors: Record<string, string> = {
  primary: "#007bff",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#17a2b8",
  secondary: "#6c757d"
};

const Dot = styled.span<{
  color: string;
  size: number;
  position?: string;
}>`
  display: inline-block;
  background-color: ${props => props.color};
  border-radius: 50%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;

  ${props =>
    props.position &&
    `
    position: absolute;
    ${props.position.includes("top") ? "top: 0;" : "bottom: 0;"}
    ${props.position.includes("right") ? "right: 0;" : "left: 0;"}
    transform: translate(50%, -50%);
  `}
`;

export const NotificationDot: React.FC<NotificationDotProps> = ({
  variant = "primary",
  className,
  size = 10,
  position
}) => {
  return <Dot color={variantColors[variant]} size={size} position={position} className={className} />;
};

import React from "react";
import { StyledBar, StyledButton } from "./HamburgerIconStyle";

interface HamburgerIconProps {
  isOpen?: boolean;
  onClick: any;
  size?: number;
  color?: string;
}

// Alternative spring-loaded hamburger variant
const HamburgerIcon = ({ isOpen, onClick, size = 24, color = "#333" }: HamburgerIconProps) => {
  return (
    <StyledButton
      onClick={onClick}
      style={{ height: `${size + 16}px`, width: `${size + 16}px` }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <StyledBar
        style={{
          width: `${size}px`,
          backgroundColor: color,
          top: isOpen ? "50%" : "30%",
          transform: isOpen ? "translateY(-50%) rotate(45deg)" : "translateY(-50%)"
        }}
      />
      <StyledBar
        style={{
          backgroundColor: color,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: isOpen ? 0 : 1,
          width: isOpen ? 0 : `${size}px`
        }}
      />
      <StyledBar
        style={{
          width: `${size}px`,
          backgroundColor: color,
          top: isOpen ? "50%" : "70%",
          transform: isOpen ? "translateY(-50%) rotate(-45deg)" : "translateY(-50%)"
        }}
      />
    </StyledButton>
  );
};

export { HamburgerIcon };

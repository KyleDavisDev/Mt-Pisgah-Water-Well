import React from "react";

interface HamburgerIconProps {
  isOpen?: boolean;
  onClick: any;
  size?: number;
  color?: string;
}

// Alternative spring-loaded hamburger variant
const HamburgerIcon = ({ isOpen, onClick, size = 24, color = "#333" }: HamburgerIconProps) => {
  return (
    <button
      className={`
        bg-transparent border-0 cursor-pointer p-2 
        flex flex-col justify-center items-center 
        relative mr-2.5
      `}
      onClick={onClick}
      style={{ height: `${size + 16}px`, width: `${size + 16}px` }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <span
        className={`h-[3px] rounded-sm absolute 
        transition-all duration-[400ms] ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]`}
        style={{
          width: `${size}px`,
          backgroundColor: color,
          top: isOpen ? "50%" : "30%",
          transform: isOpen ? "translateY(-50%) rotate(45deg)" : "translateY(-50%)"
        }}
      />
      <span
        className={`h-[3px] rounded-sm absolute 
        transition-all duration-[400ms] ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]`}
        style={{
          backgroundColor: color,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: isOpen ? 0 : 1,
          width: isOpen ? 0 : `${size}px`
        }}
      />
      <span
        className={`h-[3px] rounded-sm absolute 
        transition-all duration-[400ms] ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]`}
        style={{
          width: `${size}px`,
          backgroundColor: color,
          top: isOpen ? "50%" : "70%",
          transform: isOpen ? "translateY(-50%) rotate(-45deg)" : "translateY(-50%)"
        }}
      />
    </button>
  );
};

export { HamburgerIcon };

import * as React from "react";
import styled from "../../theme/styled-components";

export interface ButtonProps {
  children: string | React.JSX.Element | Array<string | React.JSX.Element>;
  displayType?: "outline" | "solid";
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FunctionComponent<ButtonProps> = props => {
  const { style, onClick, type = "button", fullWidth = false, disabled = false, children } = props;

  const getButtonClasses = (props: ButtonProps) => {
    const baseClasses =
      "text-base font-futura px-4 py-2 transition-all duration-200 ease-out rounded-sm border-2 no-underline";

    const widthClasses = fullWidth ? "w-full" : "w-auto";

    const variantClasses =
      props.displayType === "outline"
        ? "border-primaryThemeColor bg-transparent text-primaryThemeColor"
        : "border-primaryThemeColor bg-primaryThemeColor text-white";

    const hoverClasses =
      props.displayType === "outline"
        ? "hover:border-primaryDarkThemeColor hover:bg-transparent hover:text-primaryDarkThemeColor"
        : "hover:border-primaryDarkThemeColor hover:bg-primaryDarkThemeColor hover:text-white";

    const disabledClasses = disabled
      ? props.displayType === "outline"
        ? "disabled:text-black disabled:bg-neutral-500 disabled:border-neutral-500 disabled:cursor-not-allowed"
        : "disabled:text-white disabled:bg-primaryDarkThemeColor disabled:border-primaryDarkThemeColor disabled:cursor-not-allowed"
      : "cursor-pointer";

    const svgClasses = "[&_svg]:w-5 [&_svg]:pl-2.5 [&_svg]:transition-all [&_svg]:duration-200 [&_svg]:ease-out";
    const svgHoverClasses =
      props.displayType === "outline" ? "hover:[&_svg]:fill-primaryDarkThemeColor" : "hover:[&_svg]:fill-white";

    return `${baseClasses} ${widthClasses} ${variantClasses} ${hoverClasses} ${disabledClasses} ${svgClasses} ${svgHoverClasses}`;
  };

  return (
    <div className={`inline-block ${props.fullWidth ? "w-full" : "w-auto"} ${props.className}`} style={style}>
      <button
        className={`${getButtonClasses(props)}`}
        onClick={onClick}
        type={type}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
};

export { Button };

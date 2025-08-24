import * as React from "react";
import styled from "../../theme/styled-components";
import { Link } from "../Link/Link";
import { Button } from "../Button/Button";

const variantStyles: Record<string, { bg: string; borderLeft: string; textColor: string; linkColor: string }> = {
  success: { bg: "#dff0d8", borderLeft: "#d0e9c6", textColor: "#3c763d", linkColor: "#2a522a" },
  warning: { bg: "#fcf8e3", borderLeft: "#faf2cc", textColor: "#8a6d3b", linkColor: "#8a6d3b" },
  default: { bg: "#f2dede", borderLeft: "#ebcccc", textColor: "#a94442", linkColor: "#a94442" }
};

export interface FlashMessageProps {
  className?: string;
  type?: "success" | "warning" | "alert";
  isVisible: boolean;
  slug?: string;
  slugText?: string;
  text?: string;
  children?: string;
  onClose?: () => void;
}

const FlashMessage: React.FC<FlashMessageProps> = props => {
  const [isVisible, setIsVisible] = React.useState(props.isVisible);
  const { slug, slugText, text, children, onClose } = props;

  if (!isVisible) {
    return null;
  }

  const getContainerStyles = (type: FlashMessageProps["type"]) => {
    const baseline = "flex flex-row w-full mb-[15px] pt-[10px] pb-[15px] box-border ";

    let backGroundColor = `bg-[${variantStyles["default"].bg}"]`;
    if (type === "success" || type === "warning") {
      backGroundColor = `bg-[${variantStyles[type].bg}"]`;
    }

    let borderLeft = `border border-l-7 border-l-[${variantStyles["default"].borderLeft}"]`;
    if (type === "success" || type === "warning") {
      borderLeft = `border border-l-7 border-l-[${variantStyles[type].borderLeft}"]`;
    }

    let textColor = `text-[${variantStyles["default"].textColor}"]`;
    if (type === "success" || type === "warning") {
      textColor = `text-[${variantStyles[type].textColor}"]`;
    }

    return `${baseline} ${backGroundColor} ${borderLeft} ${textColor}`;
  };

  const getLinkStyles = (type: FlashMessageProps["type"]) => {
    const base = `bold decoration-1 transition-all duration-200 ease-out hover:text-black focus:text-black`;

    let linkColor = `text-[${variantStyles["default"].linkColor}"]`;
    if (type === "success" || type === "warning") {
      linkColor = `text-[${variantStyles[type].linkColor}"]`;
    }

    return `${base} ${linkColor}`;
  };

  return (
    <div
      className={`
      ${getContainerStyles(props.type)}
      ${props.className}`}
    >
      <div className={"flex flex-row flex-nowrap justify-between"}>
        <div className={"max-w-11/12 w-full"}>
          {children || text}{" "}
          {slug && slugText ? (
            <Link className={`hover:te ${getLinkStyles(props.type)}`} href={slug}>
              {slugText}
            </Link>
          ) : (
            ""
          )}{" "}
        </div>
        <Button
          className={`
          [&_button]:bg-transparent [&_button]:border-0 [&_button]:text-black [&_button]:p-0
          [&_button:hover]:border-0 [&_button:hover]:text-black [&_button:hover]:bg-transparent
          [&_button:focus]:border-0 [&_button:focus]:text-black [&_button:focus]:bg-transparent
        `}
          onClick={() => (onClose ? onClose() : setIsVisible(false))}
        >
          X
        </Button>
      </div>
    </div>
  );
};

export { FlashMessage };

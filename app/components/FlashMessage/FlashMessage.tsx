import * as React from "react";

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
    console.log(type);
    let backGroundColor = { backgroundColor: variantStyles["default"].bg };
    if (type === "success" || type === "warning") {
      backGroundColor.backgroundColor = variantStyles[type].bg;
    }

    let borderColor = { borderColor: variantStyles["default"].borderLeft };
    if (type === "success" || type === "warning") {
      borderColor.borderColor = variantStyles[type].borderLeft;
    }

    let textColor = { textColor: variantStyles["default"].textColor };
    if (type === "success" || type === "warning") {
      textColor.textColor = variantStyles[type].textColor;
    }

    return { ...backGroundColor, ...borderColor, ...textColor };
  };

  const getLinkStyles = (type: FlashMessageProps["type"]) => {
    let linkColor = { color: variantStyles["default"].linkColor };
    if (type === "success" || type === "warning") {
      linkColor.color = variantStyles[type].linkColor;
    }

    return { ...linkColor };
  };

  return (
    <div
      className={`flex flex-row w-full mb-[15px] pt-[10px] pr-[15px] pb-[10px] pl-[15px] box-border
      border-t-1 border-r-1 border-b-1 border-l-[15px]
      ${props.className ? props.className : ""}`}
      style={getContainerStyles(props.type)}
    >
      <div className={"flex flex-row flex-nowrap justify-between w-full"}>
        <div className={"max-w-11/12 w-full"}>
          {children || text}{" "}
          {slug && slugText ? (
            <Link
              className={`bold decoration-1 transition-all duration-200 ease-out hover:text-black focus:text-black hover:te`}
              href={slug}
              style={getLinkStyles(props.type)}
            >
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

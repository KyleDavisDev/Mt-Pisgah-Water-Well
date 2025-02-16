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

const Button: React.FunctionComponent<ButtonProps> = (props) => {
  const {
    className,
    style,
    onClick,
    type = "button",
    fullWidth = false,
    disabled = false,
    children,
  } = props;

  return (
    <div className={className} style={style}>
      <button
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

const StyledButton = styled(Button)`
  display: inline-block;

  width: ${(props) => {
    return props.fullWidth ? "100%" : "default";
  }};

  button {
    font-size: 1rem;
    width: ${(props) => {
      return props.fullWidth ? "100%" : "default";
    }};
    text-decoration: none;
    font-family: FuturaMedium, serif;
    padding: 0.5em 1em;
    transition: all 0.2s ease;
    border-radius: 3px;
    background-color: ${(props) =>
      props.displayType === "outline"
        ? "transparent"
        : props.theme.primaryThemeColor};
    border: ${(props) => "2px solid " + props.theme.primaryThemeColor};
    color: ${(props) =>
      props.displayType === "outline" ? props.theme.black : props.theme.white2};

    &:disabled {
      color: ${(props) =>
        props.displayType === "outline"
          ? props.theme.black
          : props.theme.white};
      background-color: ${(props) =>
        props.displayType === "outline"
          ? props.theme.lightGrey
          : props.theme.primaryDarkThemeColor};
      border: ${(props) =>
        props.displayType === "outline"
          ? "2px solid " + props.theme.lightGrey
          : "2px solid " + props.theme.primaryDarkThemeColor};

      &:hover,
      &:focus {
        color: ${(props) =>
          props.displayType === "outline"
            ? props.theme.black
            : props.theme.white};
        background-color: ${(props) =>
          props.displayType === "outline"
            ? props.theme.lightGrey
            : props.theme.primaryDarkThemeColor};
        border: ${(props) =>
          props.displayType === "outline"
            ? "2px solid " + props.theme.lightGrey
            : "2px solid " + props.theme.primaryDarkThemeColor};
      }
    }

    &:hover,
    &:focus {
      cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
      background-color: ${(props) =>
        props.displayType === "outline"
          ? "transparent"
          : props.theme.primaryDarkThemeColor};
      border: ${(props) => "2px solid " + props.theme.primaryDarkThemeColor};
      color: ${(props) =>
        props.displayType === "outline"
          ? props.theme.primaryDarkThemeColor
          : props.theme.buttonFontColor};

      svg {
        fill: ${(props) =>
          props.displayType === "outline"
            ? props.theme.primaryDarkThemeColor
            : props.theme.white};
      }
    }

    svg {
      width: 20px;
      padding-left: 10px;
      transition: all 0.2s ease;
    }
  }
`;
StyledButton.displayName = "Button";

export { StyledButton as Button };

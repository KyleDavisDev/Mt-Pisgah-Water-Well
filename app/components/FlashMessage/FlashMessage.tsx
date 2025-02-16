import * as React from "react";
import styled from "../../theme/styled-components";
import { Link } from "../Link/Link";
import { Button } from "../Button/Button";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;

  width: 100%;
  margin-bottom: 15px;
`;

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
`;

const StyledContent = styled.div`
  max-width: 90%;
  width: 100%;
`;

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

const FlashMessage: React.FC<FlashMessageProps> = (props) => {
  const [isVisible, setIsVisible] = React.useState(props.isVisible);
  const { slug, slugText, text, children, className, onClose } = props;

  if (!isVisible) {
    return null;
  }

  return (
    <StyledContainer className={className}>
      <StyledDiv>
        <StyledContent>
          {children || text}{" "}
          {slug && slugText ? <Link href={slug}>{slugText}</Link> : ""}{" "}
        </StyledContent>
        <Button onClick={() => (onClose ? onClose() : setIsVisible(false))}>
          X
        </Button>
      </StyledDiv>
    </StyledContainer>
  );
};

const StyledFlashMessage = styled(FlashMessage)`
  > div {
    padding: 10px 15px;
    width: 100%;
    box-sizing: border-box;
    background-color: ${(props) =>
      props.type === "success"
        ? "#dff0d8"
        : props.type === "warning"
          ? "#fcf8e3"
          : "#f2dede"};
    border-left: 7px solid
      ${(props) =>
        props.type === "success"
          ? "#d0e9c6"
          : props.type === "warning"
            ? "#faf2cc"
            : "#ebcccc"};
    color: ${(props) =>
      props.type === "success"
        ? "#3c763d"
        : props.type === "warning"
          ? "#8a6d3b"
          : "#a94442"};
    a {
      color: ${(props) =>
        props.type === "success"
          ? "#2a522a"
          : props.type === "warning"
            ? "#8a6d3b"
            : "#a94442"};
      font-weight: 700;
      text-decoration: underline;
      transition: all 0.2s ease;

      &:hover,
      &:focus {
        color: #333;
      }
    }

    button {
      background-color: transparent;
      border: 0;
      color: ${(props) => props.theme.black};
      padding: 0;

      &:hover,
      &:focus {
        border: 0;
        color: ${(props) => props.theme.black};
        background-color: transparent;
      }
    }
  }
`;
StyledFlashMessage.displayName = "FlashMessage";

export { StyledFlashMessage as FlashMessage };

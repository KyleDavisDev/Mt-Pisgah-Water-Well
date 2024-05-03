import styled from "styled-components";
import * as React from "react";
import { Button } from "../Button/Button";
import { findDOMNode } from "react-dom";

export interface ModalProps {
  children: string | React.JSX.Element | Array<string | React.JSX.Element>;
  isActive: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClose: () => void;
}

const Modal: React.FunctionComponent<ModalProps> = (props) => {
  const onOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    // Grab the x and y coordinates of the event
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    // Find the DOM element that was dragged on
    const elementAtMouse = document.elementFromPoint(mouseX, mouseY);
    const clickedOnElement = findDOMNode(elementAtMouse);
    if (!clickedOnElement) return;

    const label = (clickedOnElement as Element).attributes.getNamedItem(
      "aria-labelledby",
    )?.value;
    if (label === "Close Modal") {
      props.onClose();
    }

    return;
  };

  // Add listener to body
  React.useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code.toLowerCase() === "escape") {
        props.onClose();
      }
    };

    document.body.addEventListener("keyup", handleKeyUp);

    // Cleanup the event listener on component unmount
    return () => {
      document.body.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      className={props.className}
      style={props.style}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => onOutsideClick(e)}
      aria-labelledby={`Close Modal`}
    >
      <div>
        <div>
          <div>{props.children}</div>
          <Button onClick={() => props.onClose()}>X</Button>
        </div>
      </div>
    </div>
  );
};

const StyledModal = styled(Modal)`
    z-index: auto;
    display: ${(props) => {
      return props.isActive ? "block" : "none";
    }};
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background: rgba(0, 0, 0, 0.35);

    > div {
        position: fixed;
        display: ${(props) => {
          return props.isActive ? "block" : "none";
        }};
        background: ${(props) => props.theme.white};
        width: 33%;
        height: auto;
        top: 20%;
        left: 50%;
        transform: translate(-50%, 0);
        border-radius: ${(props) => props.theme.borderRadiusSize};
        padding: 20px;
        color: rgba(0, 0, 139, 0.7);

        > div {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;

            > div:first-child {
                max-width: 90%;
                width: 100%;
            }

            > div:last-child {
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
        }


    }
}
`;

export { StyledModal as Modal };

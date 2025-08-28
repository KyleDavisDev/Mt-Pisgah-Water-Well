import * as React from "react";
import { Button } from "../Button/Button";

export interface ModalProps {
  children: string | React.JSX.Element | Array<string | React.JSX.Element>;
  isActive: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClose: () => void;
}

const Modal: React.FunctionComponent<ModalProps> = props => {
  const { onClose } = props;

  const onOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 0) {
      // a 'enter' keypress occurred
      return;
    }

    // Prevent closing if text is selected
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    // Prevent closing if text inside of input element is selected
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") &&
      activeElement.selectionStart !== activeElement.selectionEnd
    ) {
      return;
    }

    // Grab the x and y coordinates of the event
    const mouseX = e.pageX;
    const mouseY = e.pageY;

    // Find the DOM element that was clicked on
    const elementAtMouse = document.elementFromPoint(mouseX, mouseY);
    if (!elementAtMouse) return;

    const label = (elementAtMouse as Element).attributes.getNamedItem("aria-labelledby")?.value;
    if (label === "Close Modal") {
      onClose();
    }

    return;
  };

  // Add listener to body
  React.useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code.toLowerCase() === "escape") {
        onClose();
      }
    };

    document.body.addEventListener("keyup", handleKeyUp);

    // Cleanup the event listener on component unmount
    return () => {
      document.body.removeEventListener("keyup", handleKeyUp);
    };
  }, [onClose]);

  return (
    <div
      className={`z-auto fixed top-0 left-0 h-screen w-screen bg-translucentBackground
        ${props.isActive ? "block" : "hidden"}
        ${props.className}`}
      style={props.style}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => onOutsideClick(e)}
      aria-labelledby={`Close Modal`}
    >
      <div
        className={`fixed bg-white w-1/3 h-auto top-1/5 left-1/2 rounded-md p-[20px] text-black -translate-x-1/2 translate-y-0
        ${props.isActive ? "block" : "hidden"}
        `}
      >
        <div className={"flex flex-row flex-nowrap justify-between"}>
          <div className={"max-w-10/12 w-full"}>{props.children}</div>
          <Button
            className={`
          [&_button]:bg-transparent [&_button]:border-0 [&_button]:text-black [&_button]:p-0
          [&_button:hover]:border-0 [&_button:hover]:text-black [&_button:hover]:bg-transparent
          [&_button:focus]:border-0 [&_button:focus]:text-black [&_button:focus]:bg-transparent
        `}
            displayType={"outline"}
            onClick={() => props.onClose()}
          >
            X
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Modal };

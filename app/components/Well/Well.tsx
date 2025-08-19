import * as React from "react";

export interface WellProps {
  className?: string;
  children: string | React.JSX.Element | (string | React.JSX.Element)[];
  style?: React.CSSProperties;
}

const Well: React.FC<WellProps> = props => {
  return (
    <div
      className="
        max-w-[2000px] w-full mx-0
        border-1 border-white bg-white rounded-5
        flex flex-col justify-start
        transition-all duration-200 ease-linear
        p-4 box-border
        [&>a:last-child]:mt-auto [&>a:last-child]:mx-auto [&>a:last-child]:mb-0
      "
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export default Well;

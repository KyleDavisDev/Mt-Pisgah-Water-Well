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
       bg-white
        flex flex-col justify-start
        p-4
      "
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export default Well;

import * as React from "react";

import { StyledDiv } from "./WellStyle";

export interface WellProps {
  className?: string;
  children: string | React.JSX.Element | (string | React.JSX.Element)[];
  style?: React.CSSProperties;
}

const Well: React.FC<WellProps> = props => {
  return (
    <StyledDiv className={props.className} style={props.style}>
      {props.children}
    </StyledDiv>
  );
};

export default Well;

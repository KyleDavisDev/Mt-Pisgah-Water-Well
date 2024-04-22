import * as React from "react";

import styled from "../../theme/styled-components";

export interface LabelProps {
    children: string | React.JSX.Element | Array<string | React.JSX.Element>;
    className?: string;
    htmlFor?: string;
}

const StyledLabel = styled.label`
  text-transform: uppercase;
  color: #676767;
  display: block;
  clear: both;
  font-family: FuturaMedium;
`;

const Label: React.FC<LabelProps> = props => {
    const { htmlFor, className, children } = props;

    return (
        <StyledLabel htmlFor={htmlFor} className={className}>
            {children}
        </StyledLabel>
    );
};

export default Label;

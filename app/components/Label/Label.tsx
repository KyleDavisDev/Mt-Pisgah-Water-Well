import * as React from "react";

import styled from "../../theme/styled-components";

export interface LabelProps {
  children: string | React.JSX.Element | Array<string | React.JSX.Element>;
  className?: string;
  htmlFor?: string;
  onClick?: () => void;
}

const Label: React.FC<LabelProps> = props => {
  const { htmlFor, className, children, onClick } = props;

  return (
    <label
      htmlFor={htmlFor}
      className={`text-black block clear-both font-(family-name:FuturaMedium) ${className}`}
      onClick={onClick}
    >
      {children}
    </label>
  );
};

export default Label;

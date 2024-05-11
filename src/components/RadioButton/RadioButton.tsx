import * as React from "react";
import styled from "styled-components";
import Label from "../Label/Label";

export interface RadioButtonProps {
  isChecked: boolean;
  id: string;
  value: string;
  label: string | React.JSX.Element;
  onClick: (event: string) => void;
  name?: string;
  className?: string;
}

const RadioButton: React.FC<RadioButtonProps> = props => {
  return (
    <div className={props.className}>
      <Label htmlFor={props.id} onClick={() => props.onClick(props.id)}>
        <input
          checked={props.isChecked}
          type="radio"
          name={props.name}
          value={props.value}
          id={props.id}
          onChange={() => {}}
          onClick={() => {}}
        />
        {props.label}
      </Label>
    </div>
  );
};

const StyledRadioButton = styled(RadioButton)`
  display: inline-block;
  padding: 0 30px 10px 0;
  box-sizing: border-box;

  input {
    margin-right: 10px;
  }

  label {
    padding: 10px 10px 10px 0;

    color: ${props => props.theme.siteFontColor};
  }
`;

export { StyledRadioButton as RadioButton };
export default RadioButton;

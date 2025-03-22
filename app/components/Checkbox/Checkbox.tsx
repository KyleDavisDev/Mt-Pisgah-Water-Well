import * as React from "react";

import Label from "../Label/Label";
import { CheckboxContainer, StyledCheckbox } from "./CheckboxStyle";

export interface CheckboxProps {
  id: string;
  isChecked: boolean;
  label: string;
  name?: string;
  value?: string;
  required?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = props => {
  const { isChecked, name, label, onChange, id, value, required = false } = props;

  return (
    <CheckboxContainer>
      <StyledCheckbox id={id} type="checkbox" checked={isChecked} value={value} name={name} onChange={onChange} />
      {label && (
        <Label htmlFor={id}>
          {label}
          {required ? "*" : ""}
        </Label>
      )}
    </CheckboxContainer>
  );
};

export default Checkbox;

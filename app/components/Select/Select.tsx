import * as React from "react";

import Label from "../Label/Label";
import { SelectContainer, StyledSelect } from "./SelectStyle";

export interface SelectProps {
  id: string;
  options: { name: string; value: string }[];
  selectedValue: string;
  name?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
  required?: boolean;
  onSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select: React.FC<SelectProps> = (props) => {
  // get info from props and assign defaults if needed
  const {
    className,
    options,
    name,
    label,
    onSelect,
    selectedValue,
    id,
    showLabel = false,
    required = false,
  } = props;

  return (
    <div className={className}>
      {showLabel && label && (
        <Label htmlFor={id}>
          {label}
          {required ? "*" : ""}
        </Label>
      )}
      <SelectContainer>
        <StyledSelect
          id={id}
          onChange={onSelect}
          value={selectedValue}
          name={name}
        >
          {options.map((opt, ind) => {
            return (
              <option
                key={ind + "-" + opt.name}
                value={opt.value}
                selected={selectedValue === opt.value}
              >
                {opt.name}
              </option>
            );
          })}
        </StyledSelect>
      </SelectContainer>
    </div>
  );
};

export default Select;

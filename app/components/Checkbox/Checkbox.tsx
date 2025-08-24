import * as React from "react";

import Label from "../Label/Label";

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
    <div className={"w-full pl-[10px]"}>
      <input
        className={`
      bg-white border-inputBorder cursor-pointer inline-block relative
        transition-[background-color,color,border] duration-300 ease-in-out
        align-middle h-[38px] py-0 pr-[40px] pl-[15px] text-base
      `}
        id={id}
        type="checkbox"
        checked={isChecked}
        value={value}
        name={name}
        onChange={onChange}
      />
      {label && (
        <Label htmlFor={id} className={"inline hover:cursor-pointer"}>
          {label}
          {required ? "*" : ""}
        </Label>
      )}
    </div>
  );
};

export default Checkbox;

import * as React from "react";

import Label from "../Label/Label";

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

const Select: React.FC<SelectProps> = props => {
  // get info from props and assign defaults if needed
  const { className, options, name, label, onSelect, selectedValue, id, showLabel = false, required = false } = props;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {showLabel && label && (
        <Label htmlFor={id}>
          {label}
          {required ? "*" : ""}
        </Label>
      )}
      <div
        className={`w-full bg-[#f5f5f5] mt-[5px] mb-[15px] relative
          after:absolute after:scale-50 after:content-[url('/static/ChevronDown.png')] 
          after:pointer-events-none after:right-0 after:-top-[7px]  
      `}
      >
        <select
          className={`w-full bg-white border border-inputBorder cursor-pointer 
            inline-block relative transition-[background-color,color,border] 
            duration-300 ease-in-out align-middle h-[38px] py-0 pr-[40px] pl-[15px] text-base
        `}
          id={id}
          onChange={onSelect}
          value={selectedValue}
          name={name}
        >
          {options.map((opt, ind) => {
            return (
              <option key={ind + "-" + opt.name} value={opt.value} selected={selectedValue === opt.value}>
                {opt.name}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default Select;

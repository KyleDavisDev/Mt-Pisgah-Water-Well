import * as React from "react";
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
    <div className={`inline-block pt-0 pr-[30px] pb-[10px] pl-0 box-border ${props.className}`}>
      <Label
        className={"pt-[10px] pr-[10px] pb-[10px] pl-0 text-black"}
        htmlFor={props.id}
        onClick={() => props.onClick(props.id)}
      >
        <input
          className={"mr-[10px]"}
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

export { RadioButton };

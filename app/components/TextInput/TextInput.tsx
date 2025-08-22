import * as React from "react";

import Label from "../Label/Label";

export interface TextInputProps {
  id: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  showLabel?: boolean;
  type?: "text" | "password" | "email" | "date";
  className?: string;
  disabled?: boolean;
  requirementText?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  value?: string | number;
  style?: React.CSSProperties;
}

const TextInput: React.FunctionComponent<TextInputProps> = props => {
  // grab info from props and assign defaults if needed
  const {
    id,
    type = "text",
    disabled = false,
    required = false,
    showLabel = false,
    label,
    className,
    placeholder,
    requirementText,
    onChange,
    onBlur,
    onFocus,
    value,
    name,
    style
  } = props;

  return (
    <div className={`flex flex-col w-full ${className}`} style={style}>
      {showLabel && label && (
        <Label htmlFor={id}>
          {label}
          {required ? <span style={{ color: "#B20000" }}>*</span> : ""}
        </Label>
      )}

      <input
        className={`w-full max-w-full p-[10px] box-border mt-[5px] mb-[15px] font-sans border border-inputBorder font-System shadow-none
        ${props.requirementText ? "mb-0" : "bg-white"}
        ${props.disabled ? "bg-grey" : "bg-white"}
        ${props.disabled ? "hover:cursor-not-allowed" : "hover:cursor-auto"}
        `}
        type={type}
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        aria-required={required}
        disabled={disabled}
        aria-disabled={disabled}
        onBlur={onBlur}
        onFocus={onFocus}
      />

      {requirementText && <p>{requirementText}</p>}
    </div>
  );
};

export default TextInput;

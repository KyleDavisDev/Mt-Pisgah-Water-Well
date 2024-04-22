import * as React from "react";

import Label from "../Label/Label";
import { StyledDiv, StyledInput } from "./TextInputStyle";
import styled from "../../theme/styled-components";

export interface TextInputProps {
  id: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  showLabel?: boolean;
  type?: "text" | "password" | "email";
  className?: string;
  disabled?: boolean;
  requirementText?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
}

const TextInput: React.FunctionComponent<TextInputProps> = (props) => {
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
    value,
    name,
  } = props;

  return (
    <StyledDiv className={className}>
      {showLabel && label && (
        <Label htmlFor={id}>
          {label}
          {required ? <span style={{ color: "#B20000" }}> *</span> : ""}
        </Label>
      )}

      <StyledInput
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
      />

      {requirementText && <p>{requirementText}</p>}
    </StyledDiv>
  );
};

const StyledTextInput = styled(TextInput)`
  input {
    background-color: ${(props) =>
      props.disabled ? "#eee" : props.theme.white};
    box-shadow: none;
    margin-bottom: ${(props) => props.requirementText && "0px"};

    :hover,
    :focus {
      cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
    }
  }
`;

export { StyledTextInput as TextInput };
export default TextInput;

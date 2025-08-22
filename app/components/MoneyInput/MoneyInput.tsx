import React, { ChangeEvent } from "react";
import { formatDollarsToPennies, formatPenniesToDollars } from "../../admin/dashboard/util";
import TextInput from "../TextInput/TextInput";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "id"> {
  id: string;
  valueInPennies: number;
  onChange: (value: number | null) => void;
  name?: string;
  label?: string;
  showLabel?: boolean;
}

/**
 * Formats a number into a currency string using Intl.NumberFormat.
 * @param value The number to format.
 * @returns The formatted string or an empty string if value is null/undefined.
 */
const formatMoney = (value: number | null | undefined): string => {
  return formatPenniesToDollars(value);
};

/**
 * Parses a money string back into a number.
 * @param formattedValue The string from the input field.
 * @returns The parsed number or null if the string is empty or invalid.
 */
const parseMoneyToPennies = (formattedValue: string): number => {
  return formatDollarsToPennies(formattedValue);
};

const MoneyInput: React.FunctionComponent<MoneyInputProps> = ({
  id,
  valueInPennies,
  onChange,
  name,
  showLabel,
  label
}) => {
  const [internalValueInPennies, setInternalValueInPennies] = React.useState<number>(valueInPennies);
  const [displayValue, setDisplayValue] = React.useState<string>(formatMoney(valueInPennies));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setDisplayValue(inputValue); // Update local state immediately for responsiveness

    const valueInPennies = parseMoneyToPennies(inputValue);
    setInternalValueInPennies(valueInPennies);

    // pass val to parent
    onChange(valueInPennies);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    // Re-format the value to ensure it always displays correctly (e.g., adds ".00")
    const valueInPennies = parseMoneyToPennies(displayValue);
    const formatted = formatMoney(valueInPennies);

    setInternalValueInPennies(valueInPennies);
    setDisplayValue(formatted);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement, Element>): void => {
    if (internalValueInPennies === 0) {
      setDisplayValue("");
    }
  };

  return (
    <TextInput
      id={id}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      aria-label="money input"
      name={name}
      label={label}
      showLabel={showLabel}
    />
  );
};

export default MoneyInput;

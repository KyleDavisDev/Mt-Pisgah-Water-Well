import { MONTHS } from "./appConstants";

/**
 * Formats an input date string into a user-friendly local date format.
 * Accepts ISO date strings (e.g., "2025-04-15" or "2025-04-15T00:00:00Z").
 * Falls back to "Invalid Date" if input is not parseable.
 *
 * @param dateStr - A valid date string in ISO format.
 * @returns A string like "Apr 15, 2025"
 */
export const formatISODateToUserFriendlyLocal = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) throw new Error("Invalid Date");

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
};

/**
 * Retrieves the month name as a string from the provided month index.
 * Ensures the index is within the valid range (0-11) corresponding to
 * months January to December.
 *
 * @param index - A number representing the zero-based month index (0 = January, 11 = December).
 * @returns The month name as a string (e.g., "January").
 *          Returns "Invalid Month Index" if the index is out of range.
 */
export const getMonthStrFromMonthIndex = (index: number): string => {
  if (index < 0 || index > MONTHS.length) {
    return "Invalid Month Index";
  }
  return MONTHS[index - 1];
};

/**
 * Capitalizes the first letter of the given string.
 *
 * @param {string} word - The input string to modify.
 * @returns {string} A new string with the first letter capitalized and the rest of the characters unchanged.
 */
export const capitalizeFirstLetterAndLowercaseRest = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

/**
 * Formats an amount in pennies into a dollar string.
 * Example: 12345 (pennies) -> "$123.45".
 *
 * @param amountInPennies - The amount represented in pennies. Should be a non-negative number.
 * @returns A formatted string representing the amount in dollars (e.g., "$123.45").
 *          Returns "$0.00" if the input is not a valid non-negative number.
 */
export const formatPenniesToDollars = (amountInPennies: number | null | undefined): string => {
  if (typeof amountInPennies !== "number" || isNaN(amountInPennies) || amountInPennies < 0) {
    console.error("Invalid amount provided:", amountInPennies);
    return "$0.00";
  }
  return `$${(amountInPennies / 100).toFixed(2)}`;
};

/**
 * Parses a dollar string (e.g., "$123.45") into an amount in pennies (e.g., 12345).
 * Assumes US-style formatting (dot as decimal separator, comma as thousands separator).
 *
 * @param dollarString - The money amount as a string. Can be null or undefined.
 * @returns The amount in pennies as an integer (e.g., 12345), or 0 if the input is not a valid money string.
 */
export const formatDollarsToPennies = (dollarString: string | null | undefined): number => {
  if (dollarString === null || dollarString === undefined) {
    return 0;
  }

  // Remove currency symbols, thousands commas, and any other non-numeric characters except '.' and negative sign
  let cleanedString = dollarString.replace(/[^0-9.-]/g, "");

  // Make sure there is ~something~ to parse through
  if (cleanedString.length === 0) return 0;

  // More than one negative sign
  if ((cleanedString.match(/-/g) || []).length > 1) {
    return 0;
  }
  // Negative sign not at the beginning
  if (cleanedString.indexOf("-") > 0) {
    return 0;
  }

  // More than one decimal point
  if ((cleanedString.match(/\./g) || []).length > 1) {
    return 0;
  }
  if (cleanedString.includes(".")) {
    // Too few digits after the decimal. Add zeros
    if (cleanedString.split(".")[1].length === 0) {
      cleanedString = cleanedString + "00";
    }
    if (cleanedString.split(".")[1].length === 1) {
      cleanedString = cleanedString + "0";
    }

    // Too many digits after the decimal. Chop the rest off!
    if (cleanedString.split(".")[1].length > 2) {
      cleanedString = cleanedString.slice(0, cleanedString.indexOf(".") + 3);
    }
  } else {
    // Tack on decimals for uniformity
    cleanedString = cleanedString + ".00";
  }

  // remove decimal
  if (cleanedString.includes(".")) {
    cleanedString = cleanedString.replace(".", "");
  }

  if (cleanedString === "000") return 0;

  return parseInt(cleanedString, 10);
};

export const formatNumberWithCommas = (input: string | number): string => {
  // Convert the input to a string, regardless of its original type
  const inputAsString = String(input);

  if (!/^\d+$/.test(inputAsString)) {
    return inputAsString; // Return the original string if it contains non-digits
  }

  return inputAsString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

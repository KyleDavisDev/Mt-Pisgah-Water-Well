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
export const formatPenniesToDollars = (amountInPennies: number): string => {
  if (typeof amountInPennies !== "number" || isNaN(amountInPennies) || amountInPennies < 0) {
    console.error("Invalid amount provided:", amountInPennies);
    return "$0.00";
  }
  return `$${(amountInPennies / 100).toFixed(2)}`;
};

export const safeParseStr = (str: string) => {
  try {
    const num = parseInt(str, 10); // Parse the string to an integer with base 10
    if (isNaN(num)) {
      return 0;
    }
    return num;
  } catch (error) {
    return 0;
  }
};

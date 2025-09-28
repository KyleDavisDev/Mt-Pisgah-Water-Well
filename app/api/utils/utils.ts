import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { BadRequestError, ForbiddenError } from "./errors";
import { PaymentRepository } from "../repositories/paymentRepository";
import { InvoiceRepository } from "../repositories/invoiceRepository";

const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

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

export const getUsernameFromCookie = async (jwtCookie: RequestCookie | undefined): Promise<string> => {
  if (!jwtCookie) {
    throw new BadRequestError("Please re-login.");
  }
  const token = jwtCookie.value.split(" ")[0];
  if (!token) {
    throw new BadRequestError("Invalid token format");
  }

  const payload = jwt.verify(token, jwtPrivateKey as string);
  if (!payload || typeof payload === "string") {
    throw new BadRequestError("Invalid token");
  }

  const username = payload.username;

  if (!username) {
    throw new BadRequestError("Missing username");
  }

  return username;
};

export const validatePermission = async (username: string, permission: string): Promise<void> => {
  const user = await UserRepository.getActiveUserByPermissionAndUsername(permission, username);

  if (user === null) {
    console.warn(`User not found for ${username}`);
    throw new ForbiddenError("User does not have sufficient privileges.");
  }

  return;
};

export const validatePermissions = async (username: string, permissions: string[]): Promise<void> => {
  await Promise.all(permissions.map(x => validatePermission(username, x)));

  return;
};

/**
 * Extracts the client's IP address from a Next Request object, using common proxy headers.
 * Falls back to a default IP if not found. Also handles IPv4-mapped IPv6 addresses like "::ffff:127.0.0.1".
 *
 * @param request - The incoming Request object (e.g. from Next.js or Fetch API)
 * @returns A normalized IPv4 address as a string
 */
export const getClientIPFromRequest = (request: Request): string => {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";

  // Check the "x-forwarded-for" header first (may contain multiple comma-separated IPs)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIp = forwardedFor.split(",")[0].trim();
    return normalizeIp(clientIp || FALLBACK_IP_ADDRESS);
  }

  // Fallback to "x-real-ip" header or default
  const realIp = request.headers.get("x-real-ip");
  return normalizeIp(realIp || FALLBACK_IP_ADDRESS);
};

/**
 * Converts IPv4-mapped IPv6 addresses (e.g. "::ffff:127.0.0.1") to plain IPv4 format.
 *
 * @param ip - The IP address string to normalize
 * @returns A simplified IPv4 address if applicable
 */
const normalizeIp = (ip: string): string => {
  return ip.startsWith("::ffff:") ? ip.replace("::ffff:", "") : ip;
};

/**
 * Extracts the User-Agent string from the incoming Next.js Request.
 *
 * @param request - The Next.js Request object
 * @returns The user agent string, or "unknown" if not available
 */
export const getUserAgentFromRequest = (request: Request): string => {
  return request.headers.get("user-agent") || "unknown";
};

export const extractKeyFromRequest = (request: Request, key: string): string[] | null => {
  const url = new URL(request.url);
  return url.searchParams.getAll(key);
};

/**
 * Pads a month number to a two-digit string.
 *
 * @param {number} month - The month number (1–12).
 * @returns {string} A two-digit month string, e.g. '02' for February.
 * If the month is invalid (< 1 or > 12), it returns '01' as a safe fallback.
 */
const padMonthInteger = (month: number): string => {
  if (month < 1 || month > 12) return "01";

  return month < 10 ? `0${month}` : month.toString();
};

/**
 * Given a year and month, returns the start and end of that month,
 * as well as the start and end of the next month.
 *
 * @param {string} year - The 4-digit year (e.g., '2025').
 * @param {string} month - The 1- or 2-digit month (e.g., '1' or '01'). Will be normalized to '01'–'12'.
 * @returns {Object} An object containing:
 *   - startOfMonth: e.g., '2025-02-01'
 *   - endOfMonth: e.g., '2025-02-28'
 *   - startOfNextMonth: e.g., '2025-03-01'
 *   - endOfNextMonth: e.g., '2025-03-28'
 *
 * Note: February and other months are simplified to 28 days
 * to avoid needing actual calendar day logic.
 */
export const getStartAndEndOfProvidedMonthAndNextMonth = (
  year: string,
  month: string
): { startOfMonth: string; endOfMonth: string; startOfNextMonth: string; endOfNextMonth: string } => {
  // Ensure year is a 4-digit string
  let safeYear = year.padStart(4, "0");
  const numericYear = parseInt(safeYear, 10);

  // Normalize and clamp month to range 1–12
  let numericMonth = parseInt(month, 10);
  if (isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    numericMonth = 1;
  }
  const formattedMonth = padMonthInteger(numericMonth);

  const startOfMonth = `${year}-${formattedMonth}-01`;
  const endOfMonth = `${year}-${formattedMonth}-28`;

  let nextMonth = numericMonth + 1;
  let nextYear = numericYear;

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const paddedNextMonth = padMonthInteger(nextMonth);

  const startOfNextMonth = `${nextYear}-${paddedNextMonth}-01`;
  const endOfNextMonth = `${nextYear}-${paddedNextMonth}-28`;

  return { startOfMonth, endOfMonth, startOfNextMonth, endOfNextMonth };
};

/**
 * Retrieves the current account balance for a specific property.
 *
 * This function calculates the balance by asynchronously fetching
 * the total payments and total owed amounts associated with the
 * provided property ID and then performing a subtraction
 * (total payments - total owed).
 *
 * @param {number} propertyId - The unique identifier of the property.
 * @returns {Promise<number>} A promise that resolves to the account balance
 * in pennies for the given property ID.
 */
export const getCurrentPropertyAccountBalance = async (propertyId: number): Promise<number> => {
  if (propertyId <= 0) return 0;

  const [totalPayment, totalOwed] = await Promise.all([
    PaymentRepository.findActiveTotalByPropertyIds([propertyId]),
    InvoiceRepository.findActiveTotalByPropertyIds([propertyId])
  ]);

  // It's possible for `totalPayment` to be empty here like in the case of the Well property
  // since that property, technically, doesn't make any payments.
  return (!!totalPayment[0] ? totalPayment[0].amount_in_pennies : 0) - totalOwed[0].amount_in_pennies;
};

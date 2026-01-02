import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { BadRequestError, ForbiddenError, ResourceNotFoundError } from "./errors";
import { PaymentRepository } from "../repositories/paymentRepository";
import { InvoiceRepository } from "../repositories/invoiceRepository";
import { HomeownerRepository } from "../repositories/homeownerRepository";
import { PropertyRepository } from "../repositories/propertyRepository";
import { BillRepository } from "../repositories/billRepository";
import { FeeRepository } from "../repositories/FeeRepository";

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
 * Parse a date string in `yyyy-mm-dd` form and return zero-padded components with safe defaults.
 *
 * @param {string} date - Date string expected in `yyyy-mm-dd` format.
 * @returns {{ year: string; month: string; day: string }} An object containing:
 *   - `year`: 4-digit year (default: 1970)
 *   - `month`: 2-digit month (default: 01)
 *   - `day`: 2-digit day (default: 01)
 */
export const parseYMD = (date: string): { year: string; month: string; day: string } => {
  const DEFAULT = { year: "1970", month: "01", day: "01" };

  if (!date) return DEFAULT;

  const match = date.match(/^(\d{1,4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return DEFAULT;

  let [, yearRaw, monthRaw, dayRaw] = match;

  const year = yearRaw.padStart(4, "0");

  const monthNum = parseInt(monthRaw, 10);
  const month = isNaN(monthNum) || monthNum < 1 || monthNum > 12 ? "01" : monthNum.toString().padStart(2, "0");

  const dayNum = parseInt(dayRaw, 10);
  const day = isNaN(dayNum) || dayNum < 1 || dayNum > 31 ? "01" : dayNum.toString().padStart(2, "0");

  return { year, month, day };
};

/**
 * Given a year and month, returns the start and end of that month, as well as the start and end of the next month
 * and the previous month.
 *
 * @param {string} year - The 4-digit year (e.g., '2025').
 * @param {string} month - The 1- or 2-digit month (e.g., '1' or '01'). Will be normalized to '01'–'12'.
 * @returns {Object} An object containing:
 *   - startOfPreviousMonth: e.g., '2025-01-01'
 *   - endOfPreviousMonth: e.g., '2025-01-28'
 *   - startOfCurrentMonth: e.g., '2025-02-01'
 *   - endOfCurrentMonth: e.g., '2025-02-28'
 *   - startOfNextMonth: e.g., '2025-03-01'
 *   - endOfNextMonth: e.g., '2025-03-28'
 *
 * Note: All months are simplified to having 28 days in order to avoid needing actual calendar day logic.
 */
export const getAdjacentMonthRanges = (
  year: string,
  month: string
): {
  startOfPreviousMonth: string;
  endOfPreviousMonth: string;
  startOfCurrentMonth: string;
  endOfCurrentMonth: string;
  startOfNextMonth: string;
  endOfNextMonth: string;
} => {
  // Ensure year is a 4-digit string and parse numeric year
  const safeYear = year.padStart(4, "0");
  const numericYear = parseInt(safeYear, 10);

  // Normalize and clamp month to range 1–12
  let numericMonth = parseInt(month, 10);
  if (isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    numericMonth = 1;
  }
  const formattedMonth = padMonthInteger(numericMonth);

  // Current month start/end (28-day simplification)
  const startOfCurrentMonth = `${safeYear}-${formattedMonth}-01`;
  const endOfCurrentMonth = `${safeYear}-${formattedMonth}-28`;

  // Previous month computation
  let prevMonth = numericMonth - 1;
  let prevYear = numericYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear = numericYear - 1;
  }
  const paddedPrevMonth = padMonthInteger(prevMonth);
  const startOfPreviousMonth = `${prevYear.toString().padStart(4, "0")}-${paddedPrevMonth}-01`;
  const endOfPreviousMonth = `${prevYear.toString().padStart(4, "0")}-${paddedPrevMonth}-28`;

  // Next month computation
  let nextMonth = numericMonth + 1;
  let nextYear = numericYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const paddedNextMonth = padMonthInteger(nextMonth);
  const startOfNextMonth = `${nextYear.toString().padStart(4, "0")}-${paddedNextMonth}-01`;
  const endOfNextMonth = `${nextYear.toString().padStart(4, "0")}-${paddedNextMonth}-28`;

  return {
    startOfPreviousMonth,
    endOfPreviousMonth,
    startOfCurrentMonth,
    endOfCurrentMonth,
    startOfNextMonth,
    endOfNextMonth
  };
};

export const addRandomDaysToDate = (date: string, minDays: number = 1, maxDays: number = 30) => {
  // TODO: Basic validations

  const offsetDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;

  const dt = new Date(date);
  dt.setUTCDate(dt.getUTCDate() + offsetDays);

  return `${dt.getUTCFullYear()}-${(dt.getUTCMonth() + 1).toString().padStart(2, "0")}-${dt.getUTCDate().toString().padStart(2, "0")}`;
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
    BillRepository.findActiveTotalByPropertyIds([propertyId])
  ]);

  // It's possible for `totalPayment` to be empty here like in the case of the Well property
  // since that property, technically, doesn't make any payments.
  return (
    (!!totalPayment[0] ? totalPayment[0].amount_in_pennies : 0) - (!!totalOwed[0] ? totalOwed[0].total_in_pennies : 0)
  );
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
 * @param date - The date to look at the balance at
 * @returns {Promise<number>} A promise that resolves to the account balance
 * in pennies for the given property ID.
 */
export const getPropertyAccountBalanceAtDate = async (propertyId: number, date: string): Promise<number> => {
  if (propertyId <= 0) return 0;

  const { year, month } = parseYMD(date);

  const { endOfPreviousMonth, endOfCurrentMonth } = getAdjacentMonthRanges(year, month);

  // TODO: Validate date string

  const [totalPayment, totalFeed] = await Promise.all([
    PaymentRepository.findActiveTotalByPropertyIdsAndCreatedBefore([propertyId], endOfCurrentMonth),
    FeeRepository.findActiveTotalByPropertyIdsAndCreatedBefore([propertyId], endOfPreviousMonth)
  ]);

  // It's possible for `totalPayment` to be empty here like in the case of the Well property
  // since that property, technically, doesn't make any payments.
  const totalPaid = !totalPayment[0] ? 0 : totalPayment[0].amount_in_pennies;

  const totalCharged = !totalFeed[0] ? 0 : totalFeed[0].total_in_pennies;

  return totalPaid - totalCharged;
};

/**
 * Executes an asynchronous function with retry logic for transient errors.
 *
 * Retries the provided async function up to `retries` times, waiting `delayMs` milliseconds between attempts if a
 * connection-related error is detected (e.g., database shutdown, too many connections).
 * Will throw the last encountered error if all retries fail.
 *
 * @template T - The return type of the async function.
 * @param {() => Promise<T>} fn - The async function to execute.
 * @param {number} [retries=3] - The maximum number of attempts.
 * @param {number} [delayMs=300] - Delay in milliseconds between retries.
 * @returns {Promise<T>} The result of the async function if successful.
 * @throws The last error encountered if all retries fail.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries: number = 50, delayMs: number = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      // Check for connection-related errors
      if (
        err?.code === "57P01" || // Postgres admin_shutdown
        err?.code === "53300" || // Postgres too_many_connections
        err?.message?.includes("too many clients") ||
        err?.message?.includes("connection")
      ) {
        lastError = err;
        if (attempt < retries - 1) {
          await new Promise(res => setTimeout(res, delayMs));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError;
}

export const fetchInvoiceDetails = async (id: string) => {
  const bill = await InvoiceRepository.getInvoiceById(id);
  if (!bill) {
    throw new ResourceNotFoundError("Bill not found");
  }

  // Fetch associated homeowner data, property address, historical usages, and late fees in parallel
  const [homeowner, property, historicalInvoices, lateFees] = await Promise.all([
    HomeownerRepository.getHomeownerByPropertyId(bill.property_id),
    PropertyRepository.getPropertyById(bill.property_id),
    InvoiceRepository.getRecentActiveWaterInvoicesByPropertyBeforeBillingMonthYear(
      bill.property_id,
      11,
      bill.metadata.billing_month,
      bill.metadata.billing_year
    ),
    Promise.resolve(() => 0) // TODO: late fees
  ]);

  return { bill, homeowner, property, historicalInvoices };
};

export const fetchBillDetails = async (id: string) => {
  const bill = await BillRepository.getBillById(id);
  if (!bill) {
    throw new ResourceNotFoundError("Bill not found");
  }

  const { endOfCurrentMonth } = getAdjacentMonthRanges(bill.billing_year.toString(10), bill.billing_month.toString(10));

  // Fetch associated homeowner data, property address, historical fees, and late fees in parallel
  const [homeowner, property, historicalWaterFees, fees] = await Promise.all([
    HomeownerRepository.getHomeownerByPropertyId(bill.property_id),
    PropertyRepository.getPropertyById(bill.property_id),
    FeeRepository.getBilledWaterFeesByPropertyIdCreatedBeforeMonthAndYearDesc(bill.property_id, 11, endOfCurrentMonth),
    Promise.resolve(() => 0) // TODO: late fees
  ]);

  return { bill, homeowner, property, historicalWaterFees };
};

import { invoiceDTO, InvoiceDetails, homeownerDTO, propertyDTO } from "../types";
import { formatISODateToUserFriendlyLocal, formatPenniesToDollars, getMonthStrFromMonthIndex } from "../../../../util";

const WATER_COMPANY_INFO = {
  name: "Sherwood-Mt. Pisgah W.S.C",
  address: "242 Mt. Pisgah Drive",
  city: "Comfort",
  state: "Texas",
  zip: "78013",
  phone: "830-995-2371",
  fax: "",
  email: "mduarte242yahoo.com"
};

export const InvoiceDetailsMapper = (
  invoice: invoiceDTO,
  homeowner: homeownerDTO,
  property: propertyDTO,
  historicalInvoices: invoiceDTO[]
): InvoiceDetails => {
  const sortedMonthlyUsageHistory = historicalInvoices.sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.month - a.month
  );

  const baseCharge = invoice.formula.baseFeeInPennies;
  const excessUsageChargeInPennies =
    invoice.gallonsUsed > invoice.formula.baseGallons
      ? (invoice.gallonsUsed - invoice.formula.baseGallons) * invoice.formula.usageRateInPennies
      : 0;
  const lateFee = 0;
  const otherCharges = 0;
  const amountOutstanding = 0; // TODO: this should be the current balance of the account

  return {
    id: invoice.id,
    createdDate: formatISODateToUserFriendlyLocal(invoice.createdAt),
    billingPeriod: `${getMonthStrFromMonthIndex(invoice.month)} ${invoice.year}`,
    waterCompany: WATER_COMPANY_INFO,
    homeowner: {
      name: homeowner.name
    },
    property: { ...property },
    bill: {
      totalAmount: formatPenniesToDollars(
        baseCharge + excessUsageChargeInPennies + lateFee + otherCharges + amountOutstanding
      ),
      baseCharge: formatPenniesToDollars(invoice.formula.baseFeeInPennies),
      excessUsageChargeInPennies: excessUsageChargeInPennies,
      lateFee,
      otherCharges,
      amountOutstanding,
      formula: {
        baseFeeInPennies: invoice.formula.baseFeeInPennies,
        baseGallons: invoice.formula.baseGallons,
        description: invoice.formula.description,
        usageRateInPennies: invoice.formula.usageRateInPennies
      }
    },
    currentUsage: {
      start: 0, // These would need to come from actual meter readings
      end: invoice.gallonsUsed,
      usage: invoice.gallonsUsed
    },
    monthlyUsageHistory: sortedMonthlyUsageHistory
  };
};

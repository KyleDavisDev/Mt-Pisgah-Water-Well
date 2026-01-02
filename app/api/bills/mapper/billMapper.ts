import Homeowner from "../../../models/Homeowners";
import Property from "../../../models/Properties";
import Invoice from "../../../models/Invoice";

import { InvoiceDetails } from "../types";
import { PRICING_FORMULAS } from "../../../fees/water/pricingFormulas";

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

export const invoiceDetailsMapper = (
  currentInvoice: Invoice,
  homeowner: Homeowner,
  property: Property,
  historicalInvoices: Invoice[]
): InvoiceDetails => {
  const sortedMonthlyUsageHistory = historicalInvoices.sort((a, b) =>
    b.metadata.billing_year !== a.metadata.billing_year
      ? b.metadata.billing_year - a.metadata.billing_year
      : b.metadata.billing_month - a.metadata.billing_month
  );

  const baseCharge = PRICING_FORMULAS[currentInvoice.metadata.formula_used].baseFeeInPennies;
  const excessUsageChargeInPennies =
    currentInvoice.metadata.gallons_used > PRICING_FORMULAS[currentInvoice.metadata.formula_used].baseGallons
      ? (currentInvoice.metadata.gallons_used - PRICING_FORMULAS[currentInvoice.metadata.formula_used].baseGallons) *
        PRICING_FORMULAS[currentInvoice.metadata.formula_used].usageRateInPennies
      : 0;
  const lateFee = 0; // TODO: Do we ever have this?
  const otherCharges = 0; // TODO: Do we ever have this?

  const totalChargeAmountInPennies = baseCharge + excessUsageChargeInPennies + lateFee + otherCharges;

  return {
    id: currentInvoice.id,
    createdDate: currentInvoice.created_at,
    billingPeriod: {
      billingMonth: currentInvoice.metadata.billing_month,
      billingYear: currentInvoice.metadata.billing_year
    },
    waterCompany: WATER_COMPANY_INFO,
    homeowner: {
      name: homeowner.name
    },
    property: { ...property },
    bill: {
      totalChargeAmountInPennies: totalChargeAmountInPennies,
      accountBalanceBeforeInPennies: currentInvoice.metadata.balance_in_pennies_start,
      accountBalanceAfterInPennies: Math.max(currentInvoice.metadata.balance_in_pennies_end, 0),
      baseCharge: PRICING_FORMULAS[currentInvoice.metadata.formula_used].baseFeeInPennies,
      excessUsageChargeInPennies: excessUsageChargeInPennies,
      lateFee,
      otherCharges,
      amountOwingInPennies:
        currentInvoice.metadata.balance_in_pennies_end > 0
          ? 0
          : Math.abs(currentInvoice.metadata.balance_in_pennies_end),
      formula: {
        baseFeeInPennies: PRICING_FORMULAS[currentInvoice.metadata.formula_used].baseFeeInPennies,
        baseGallons: PRICING_FORMULAS[currentInvoice.metadata.formula_used].baseGallons,
        description: PRICING_FORMULAS[currentInvoice.metadata.formula_used].description,
        usageRateInPennies: PRICING_FORMULAS[currentInvoice.metadata.formula_used].usageRateInPennies
      }
    },
    currentUsage: {
      start: 0, // These would need to come from actual meter readings
      end: currentInvoice.metadata.gallons_used,
      usage: currentInvoice.metadata.gallons_used
    },
    monthlyUsageHistory: sortedMonthlyUsageHistory.map(x => {
      return {
        id: x.id,
        amountInPennies: x.amount_in_pennies,
        balanceInPenniesStart: x.metadata.balance_in_pennies_start,
        balanceInPenniesEnd: x.metadata.balance_in_pennies_end,
        formula: {
          baseFeeInPennies: PRICING_FORMULAS[x.metadata.formula_used].baseFeeInPennies,
          baseGallons: PRICING_FORMULAS[x.metadata.formula_used].baseGallons,
          description: PRICING_FORMULAS[x.metadata.formula_used].description,
          usageRateInPennies: PRICING_FORMULAS[x.metadata.formula_used].usageRateInPennies
        },
        gallonsUsed: x.metadata.gallons_used,
        gallonsStart: x.metadata.gallons_start,
        gallonsEnd: x.metadata.gallons_end,
        month: x.metadata.billing_month,
        year: x.metadata.billing_year,
        isActive: x.is_active,
        createdAt: x.created_at
      };
    })
  };
};

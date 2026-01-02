import Homeowner from "../../models/Homeowners";
import Property from "../../models/Properties";
import Bill from "../../models/Bills";

import { BillDetails } from "../types/types";
import { PRICING_FORMULAS } from "../../fees/water/pricingFormulas";
import Fee, { WaterUsageMetaData } from "../../models/Fee";
import { parseYMD } from "../../utils/utils";

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

export const billDetailsMapper = ({
  currentBill,
  homeowner,
  property,
  historicalWaterFees
}: {
  currentBill: Bill;
  homeowner: Homeowner;
  property: Property;
  historicalWaterFees: Fee[];
}): BillDetails => {
  const sortedHistoricalWaterFees = historicalWaterFees.sort(
    (a, b) => new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
  );

  const currentWaterUsage = currentBill.metadata.water_usage;
  // TODO: Remove this restriction? What if we want an invoice that isn't associated with water usage?
  if (!currentWaterUsage) throw Error("Must have water usage");

  const formulaUsed = PRICING_FORMULAS[currentWaterUsage.formula_used];

  const baseCharge = PRICING_FORMULAS[currentWaterUsage.formula_used].baseFeeInPennies;
  const excessUsageChargeInPennies =
    currentWaterUsage.gallons_used > formulaUsed.baseGallons
      ? (currentWaterUsage.gallons_used - formulaUsed.baseGallons) * formulaUsed.usageRateInPennies
      : 0;
  const otherCharges = 0; // TODO: Do we ever have this?
  const lateFees = currentBill.metadata.late
    ? currentBill.metadata.late.map(x => {
        return { amountInPennies: x.amount_in_pennies };
      })
    : [{ amountInPennies: 0 }];

  const totalChargeAmountInPennies =
    baseCharge +
    excessUsageChargeInPennies +
    lateFees.reduce((accum, val) => {
      accum += val.amountInPennies;
      return accum;
    }, 0) +
    otherCharges;

  console.log(currentBill.billing_month, currentBill.billing_year);
  return {
    id: currentBill.id,
    createdDate: currentBill.created_at,
    billingPeriod: {
      billingMonth: currentBill.billing_month,
      billingYear: currentBill.billing_year
    },
    company: WATER_COMPANY_INFO,
    homeowner: {
      name: homeowner.name
    },
    property: { ...property },
    bill: {
      totalChargeAmountInPennies: totalChargeAmountInPennies,
      accountBalanceBeforeInPennies: currentBill.metadata.account_balance.balance_in_pennies_start,
      accountBalanceAfterInPennies: Math.max(currentBill.metadata.account_balance.balance_in_pennies_end, 0),
      baseCharge: formulaUsed.baseFeeInPennies,
      excessUsageChargeInPennies: excessUsageChargeInPennies,
      lateFees,
      otherCharges,
      amountOwingInPennies:
        currentBill.metadata.account_balance.balance_in_pennies_end > 0
          ? 0
          : Math.abs(currentBill.metadata.account_balance.balance_in_pennies_end),
      formula: {
        baseFeeInPennies: formulaUsed.baseFeeInPennies,
        baseGallons: formulaUsed.baseGallons,
        description: formulaUsed.description,
        usageRateInPennies: formulaUsed.usageRateInPennies
      }
    },
    currentUsage: {
      start: currentWaterUsage.gallons_start, // These would need to come from actual meter readings
      end: currentWaterUsage.gallons_end,
      usage: currentWaterUsage.gallons_used
    },
    previousUsages: sortedHistoricalWaterFees
      .filter(x => {
        return "gallons_start" in x.metadata;
      })
      .map(x => {
        return {
          id: x.id,
          amountInPennies: x.amount_in_pennies,
          gallonsUsed: (x.metadata as WaterUsageMetaData).gallons_used,
          gallonsStart: (x.metadata as WaterUsageMetaData).gallons_start,
          gallonsEnd: (x.metadata as WaterUsageMetaData).gallons_end,
          month: (x.metadata as WaterUsageMetaData).usage_month,
          year: (x.metadata as WaterUsageMetaData).usage_year,
          isActive: x.is_active,
          createdAt: x.created_at
        };
      })
  };
};

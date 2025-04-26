import { billDTO, BillDetails, homeownerDTO, propertyDTO, historicalUsageDTO } from "../types";
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

export const generateBillDetails = (
  bill: billDTO,
  homeowner: homeownerDTO,
  property: propertyDTO,
  historicalUsage: historicalUsageDTO[]
): BillDetails => {
  const sortedMonthlyUsageHistory = historicalUsage.sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.month - a.month
  );

  const baseCharge = bill.formula.baseFeeInPennies;
  const excessUsageCharge = (bill.gallonsUsed - bill.formula.baseGallons) * bill.formula.usageRateInPennies;
  const lateFee = 0;
  const otherCharges = 0;
  const amountOutstanding = 0;

  return {
    id: bill.id,
    createdDate: formatISODateToUserFriendlyLocal(bill.createdAt),
    billingPeriod: `${getMonthStrFromMonthIndex(bill.month)} ${bill.year}`,
    waterCompany: WATER_COMPANY_INFO,
    homeowner: {
      name: homeowner.name
    },
    property: { ...property },
    bill: {
      totalAmount: formatPenniesToDollars(baseCharge + excessUsageCharge + lateFee + otherCharges + amountOutstanding),
      baseCharge: formatPenniesToDollars(bill.formula.baseFeeInPennies),
      excessUsageCharge: excessUsageCharge,
      lateFee,
      otherCharges,
      amountOutstanding,
      formula: {
        baseFeeInPennies: bill.formula.baseFeeInPennies,
        baseGallons: bill.formula.baseGallons,
        description: bill.formula.description,
        usageRateInPennies: bill.formula.usageRateInPennies
      }
    },
    currentUsage: {
      start: 0, // These would need to come from actual meter readings
      end: bill.gallonsUsed,
      usage: bill.gallonsUsed
    },
    monthlyUsageHistory: sortedMonthlyUsageHistory
  };
};

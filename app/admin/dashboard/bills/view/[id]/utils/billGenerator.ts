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

  const baseCharge = bill.amountInPennies;
  const excessCharge = 0;
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
    charges: {
      totalAmount: formatPenniesToDollars(baseCharge + excessCharge + lateFee + otherCharges + amountOutstanding),
      baseCharge: formatPenniesToDollars(bill.amountInPennies),
      excessCharge,
      lateFee,
      otherCharges,
      amountOutstanding
    },
    currentUsage: {
      start: 0, // These would need to come from actual meter readings
      end: parseInt(bill.gallonsUsed),
      usage: parseInt(bill.gallonsUsed)
    },
    monthlyUsageHistory: sortedMonthlyUsageHistory
  };
};

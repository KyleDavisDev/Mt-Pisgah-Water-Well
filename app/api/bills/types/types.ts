export interface BillUsage {
  start: number;
  end: number;
  usage: number;
}

export interface BillCharges {
  baseCharge: number;
  excessUsageChargeInPennies: number;
  lateFees: { amountInPennies: number }[];
  otherCharges: number;
  amountOwingInPennies: number;
  totalChargeAmountInPennies: number;
  accountBalanceBeforeInPennies: number;
  accountBalanceAfterInPennies: number;
  formula: {
    description: string;
    baseFeeInPennies: number;
    baseGallons: number;
    usageRateInPennies: number;
  };
}

export interface WaterCompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string;
  email: string;
}

export interface HomeownerInfo {
  name: string;
}

export interface PropertyInfo {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface BillDetails {
  id: number;
  createdDate: string;
  billingPeriod: {
    billingMonth: number;
    billingYear: number;
  };
  company: WaterCompanyInfo;
  homeowner: HomeownerInfo;
  property: PropertyInfo;
  bill: BillCharges;
  currentUsage: BillUsage;
  previousUsages: billDTO[];
}

export interface billDTO {
  id: number;
  amountInPennies: number;
  gallonsUsed: number;
  gallonsStart: number;
  gallonsEnd: number;
  month: number;
  year: number;
  isActive: boolean;
  createdAt: string;
}

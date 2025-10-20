export interface BillUsage {
  start: number;
  end: number;
  usage: number;
}

export interface BillCharges {
  baseCharge: number;
  excessUsageChargeInPennies: number;
  lateFee: number;
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

export interface InvoiceDetails {
  id: number;
  createdDate: string;
  billingPeriod: {
    billingMonth: number;
    billingYear: number;
  };
  waterCompany: WaterCompanyInfo;
  homeowner: HomeownerInfo;
  property: PropertyInfo;
  bill: BillCharges;
  currentUsage: BillUsage;
  monthlyUsageHistory: invoiceDTO[];
}

export interface invoiceDTO {
  id: number;
  amountInPennies: number;
  balanceInPenniesStart: number;
  balanceInPenniesEnd: number;
  formula: {
    description: string;
    baseFeeInPennies: number;
    baseGallons: number;
    usageRateInPennies: number;
  };
  gallonsUsed: number;
  gallonsStart: number;
  gallonsEnd: number;
  month: number;
  year: number;
  isActive: boolean;
  createdAt: string;
}

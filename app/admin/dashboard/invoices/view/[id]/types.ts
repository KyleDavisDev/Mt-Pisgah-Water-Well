export interface BillUsage {
  start: number;
  end: number;
  usage: number;
}

export interface BillCharges {
  baseCharge: string;
  excessUsageChargeInPennies: number;
  lateFee: number;
  otherCharges: number;
  amountOutstanding: number;
  totalAmount: string;
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
  id: string;
  createdDate: string;
  billingPeriod: string;
  waterCompany: WaterCompanyInfo;
  homeowner: HomeownerInfo;
  property: PropertyInfo;
  bill: BillCharges;
  currentUsage: BillUsage;
  monthlyUsageHistory: invoiceDTO[];
}

export interface invoiceDTO {
  id: string;
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

export interface homeownerDTO {
  name: string;
}

export interface propertyDTO {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface historicalUsageDTO {
  month: number;
  year: number;
  gallonsUsed: string;
  gallonsStart: string;
  gallonsEnd: string;
  amountInPennies: number;
}

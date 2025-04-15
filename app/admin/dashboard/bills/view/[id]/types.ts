export interface BillUsage {
  start: number;
  end: number;
  usage: number;
}

export interface MonthlyUsage {
  [key: string]: BillUsage;
}

export interface BillCharges {
  baseCharge: number;
  excessCharge: number;
  lateFee: number;
  otherCharges: number;
  amountOutstanding: number;
  totalAmount: number;
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
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface BillDetails {
  id: string;
  accountDate: string;
  billingPeriod: string;
  waterCompany: WaterCompanyInfo;
  homeowner: HomeownerInfo;
  charges: BillCharges;
  currentUsage: BillUsage;
  monthlyUsageHistory: MonthlyUsage;
}

export interface billVM {
  id: string;
  amountInPennies: number;
  dateCreated: string;
  gallonsUsed: string;
  isActive: string;
}

import { billVM, BillDetails } from '../types';

const WATER_COMPANY_INFO = {
  name: 'Sherwood-Mt. Pisgah W.S.C',
  address: '242 Mt. Pisgah Drive',
  city: 'Comfort',
  state: 'Texas',
  zip: '78013',
  phone: '830-995-2371',
  fax: '',
  email: 'mduarte242yahoo.com'
};

export const generateBillDetails = (bill: billVM, homeownerName: string, propertyAddress: string): BillDetails => {
  // Parse the date to get the billing period
  const date = new Date(bill.dateCreated);
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  // Split the address into components
  const [street, city, state, zip] = propertyAddress.split(',').map(s => s.trim());

  return {
    id: bill.id,
    accountDate: new Date(bill.dateCreated).toLocaleDateString(),
    billingPeriod: `${month} ${year}`,
    waterCompany: WATER_COMPANY_INFO,
    homeowner: {
      name: homeownerName,
      address: street,
      city: city || 'Comfort',
      state: state || 'Texas',
      zip: zip || '78013'
    },
    charges: {
      baseCharge: bill.amountInPennies / 100, // Convert pennies to dollars
      excessCharge: 0,
      lateFee: 0,
      otherCharges: 0,
      amountOutstanding: 0,
      totalAmount: bill.amountInPennies / 100
    },
    currentUsage: {
      start: 0, // These would need to come from actual meter readings
      end: parseInt(bill.gallonsUsed),
      usage: parseInt(bill.gallonsUsed)
    },
    monthlyUsageHistory: {
      // This is sample data - in reality, this would come from historical readings
      'Dec': { start: 1024310, end: 1025920, usage: 1610 },
      'Nov': { start: 1023030, end: 1024310, usage: 1280 },
      'Oct': { start: 1021510, end: 1023030, usage: 1520 },
      'Sep': { start: 1020290, end: 1021510, usage: 1220 },
      'Aug': { start: 1018910, end: 1020290, usage: 1380 },
      'Jul': { start: 1016780, end: 1018910, usage: 2130 },
      'Jun': { start: 1014850, end: 1016780, usage: 1930 },
      'May': { start: 1012740, end: 1014850, usage: 2110 },
      'Apr': { start: 1011050, end: 1012740, usage: 1690 },
      'Mar': { start: 1008950, end: 1011050, usage: 2100 },
      'Feb': { start: 1007640, end: 1008950, usage: 1310 },
      'Jan': { start: 1005960, end: 1007640, usage: 1680 }
    }
  };
};

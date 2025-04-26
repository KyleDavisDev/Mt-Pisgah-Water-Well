type invoiceStatusDTO = "PENDING" | "PAID" | "LATE" | "LATE_PAID" | "CANCELLED";

export interface invoiceDTO {
  id: string;
  status: invoiceStatusDTO;
  month: number;
  year: number;
  amountInPennies: number;
  dateCreated: string;
  gallonsUsed: string;
  isActive: string;
}

export interface homeownerData {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
    description: string | null | undefined;
    invoices: invoiceDTO[];
  }[];
}

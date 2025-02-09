export default interface Homeowner {
  id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  mailing_address: string;
  is_active: boolean;
}

export default interface Property {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  description?: string | null;
  homeowner_id: number;
  is_active: boolean;
}

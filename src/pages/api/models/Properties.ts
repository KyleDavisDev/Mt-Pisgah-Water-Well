export default interface Property {
  id: number;
  address: string;
  description?: string | null;
  homeowner_id: number;
  is_active: boolean;
}

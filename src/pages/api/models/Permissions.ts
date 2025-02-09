export default interface Permission {
  id: number;
  value: string;
  description?: string | null;
  is_active: boolean;
}

import Homeowners from "./Homeowners";

export default interface Properties {
  id: string;
  address: string;
  description?: string;
  homeownerId: number;
  createdAt: string;
  is_active: boolean;
  homeowner?: Homeowners;
}

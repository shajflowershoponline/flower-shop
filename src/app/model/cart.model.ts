import { CustomerUser } from "./customer-user";
import { Product } from "./product";

export class CartItems {
  cartItemId?: string;
  createdAt?: string;
  updatedAt?: string;
  quantity?: number;
  active?: boolean;
  customerUser?: CustomerUser;
  product?: Product;
  total: number;
  appliedDiscount: boolean;
}

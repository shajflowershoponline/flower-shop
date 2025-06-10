import { CustomerUser } from "./customer-user";
import { Product } from "./product";

export class CustomerUserWishlist {
  customerUserWishlistId: string;
  customerUserId: string;
  productId: string;
  dateTime: Date;
  customerUser: CustomerUser;
  product: Product;
}

import { CustomerUser } from "./customer-user";
import { Discounts } from "./discounts";

export class CustomerCoupon {
  customerCouponId?: string;
  createdDate: Date;
  active: boolean;
  customerUser?: CustomerUser;
  discount?: Discounts;
}

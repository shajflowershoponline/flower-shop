import { File } from "./file.model";
export class Discounts {
  discountId: string;
  promoCode: string;
  description: string | null;
  type: string;
  value: string;
  active: boolean;
  thumbnailFile: File;
}

import { Category } from "././category";
import { File } from "./file.model";
import { ProductCollection } from "././product-collection";
import { ProductImage } from "././product-image";
import { Discounts } from "./discounts";
import { GiftAddOns } from "./gift-add-ons";
import { CustomerUserWishlist } from "./customer-user-wish-list.model";
export class Product {
  productId: string;
  sku: string | null;
  name: string;
  shortDesc: string;
  price: number;
  discountPrice: number;
  size: number; // 1 | 2 | 3
  longDesc: string;
  interested: number;
  isSale: boolean;
  iAmInterested: boolean;
  active: boolean;
  category: Category;
  thumbnailFile: File;
  discountTagsIds: string;
  productCollections: ProductCollection[];
  productImages: ProductImage[];
  selectedGiftAddOns: GiftAddOns[];
  selectedDiscounts: Discounts[];
  customerUserWishlist: CustomerUserWishlist;
}

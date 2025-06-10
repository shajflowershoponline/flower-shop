import { File } from "./file.model";
import { ProductCollection } from "././product-collection";
export class Collection {
  collectionId: string;
  sequenceId: string;
  name: string;
  desc: string;
  productCount: string;
  active: boolean;
  thumbnailFile: File;
  isSale: boolean;
  saleFromDate: Date;
  saleDueDate: Date;
  discountTagsIds: string;
  productCollections: ProductCollection[];
}

import { File } from "./file.model";
import { Product } from "././product";
export class Category {
  categoryId: string;
  sequenceId: string;
  name: string;
  desc: string;
  productCount: string;
  active: boolean;
  thumbnailFile: File;
  products: Product[];
}

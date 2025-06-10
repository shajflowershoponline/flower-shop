
import { File } from "./file.model";
export class GiftAddOns {
  giftAddOnId: string;
  name: string;
  description: string | null;
  active: boolean;
  thumbnailFile: File;
}

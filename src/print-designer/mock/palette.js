import {
  Collection,
  CopyDocument,
  Document,
  Grid,
  Picture,
  Postcard,
  Tickets,
} from "@element-plus/icons-vue";
import { ELEMENT_PALETTE } from "../core/elementFactory";

const iconMap = {
  text: Tickets,
  image: Picture,
  table: Grid,
  barcode: Postcard,
  qrcode: Grid,
  line: Collection,
  rect: Collection,
  circle: Collection,
  pageNumber: Document,
  multiLabel: CopyDocument,
};

export const paletteItems = ELEMENT_PALETTE.map((item) => ({
  ...item,
  icon: iconMap[item.type] || Collection,
}));

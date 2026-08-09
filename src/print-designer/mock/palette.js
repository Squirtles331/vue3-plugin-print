import {
  Collection,
  CopyDocument,
  Document,
  Grid,
  Picture,
  Postcard,
  Tickets,
} from "@element-plus/icons-vue";
import { markRaw } from "vue";
import { ELEMENT_PALETTE } from "../core/elementFactory";

const asRawIcon = (component) => markRaw(component);

const iconMap = {
  text: asRawIcon(Tickets),
  image: asRawIcon(Picture),
  table: asRawIcon(Grid),
  barcode: asRawIcon(Postcard),
  qrcode: asRawIcon(Grid),
  line: asRawIcon(Collection),
  rect: asRawIcon(Collection),
  circle: asRawIcon(Collection),
  pageNumber: asRawIcon(Document),
  multiLabel: asRawIcon(CopyDocument),
};

export const paletteItems = ELEMENT_PALETTE.map((item) => ({
  ...item,
  icon: iconMap[item.type] || asRawIcon(Collection),
}));

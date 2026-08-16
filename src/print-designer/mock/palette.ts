import { Collection, CopyDocument, Document, Grid, Picture, Postcard, Tickets, } from "../ui/icons.js";
import { markRaw } from "vue";
import { ELEMENT_PALETTE } from "../core/elementFactory";
const asRawIcon = (component: any): any => markRaw(component) as any;
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
} as any;
export const paletteItems = ELEMENT_PALETTE.map((item: any): any => ({
    ...item,
    icon: iconMap[item.type] || asRawIcon(Collection),
})) as any;

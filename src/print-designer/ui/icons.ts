import { defineComponent, h } from "vue";
import PdIcon from "./primitives/PdIcon.vue";
export { ICON_PATHS } from "./iconPaths.js";
function createIcon(name: any): any {
    return defineComponent({
        name,
        setup(): any {
            return (): any => h(PdIcon, { name });
        },
    });
}
export const Bottom = createIcon("Bottom") as any;
export const Check = createIcon("Check") as any;
export const Clock = createIcon("Clock") as any;
export const Collection = createIcon("Collection") as any;
export const CollectionTag = createIcon("CollectionTag") as any;
export const CopyDocument = createIcon("CopyDocument") as any;
export const DataAnalysis = createIcon("DataAnalysis") as any;
export const DataLine = createIcon("DataLine") as any;
export const Delete = createIcon("Delete") as any;
export const Document = createIcon("Document") as any;
export const DocumentAdd = createIcon("DocumentAdd") as any;
export const Download = createIcon("Download") as any;
export const Files = createIcon("Files") as any;
export const FolderOpened = createIcon("FolderOpened") as any;
export const Grid = createIcon("Grid") as any;
export const Hide = createIcon("Hide") as any;
export const Lock = createIcon("Lock") as any;
export const Picture = createIcon("Picture") as any;
export const Plus = createIcon("Plus") as any;
export const Postcard = createIcon("Postcard") as any;
export const Printer = createIcon("Printer") as any;
export const RefreshLeft = createIcon("RefreshLeft") as any;
export const RefreshRight = createIcon("RefreshRight") as any;
export const Search = createIcon("Search") as any;
export const Setting = createIcon("Setting") as any;
export const Tickets = createIcon("Tickets") as any;
export const Top = createIcon("Top") as any;
export const Unlock = createIcon("Unlock") as any;
export const View = createIcon("View") as any;
export const ZoomIn = createIcon("ZoomIn") as any;
export const ZoomOut = createIcon("ZoomOut") as any;

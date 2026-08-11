import { defineComponent, h } from "vue";
import PdIcon from "./primitives/PdIcon.vue";
export { ICON_PATHS } from "./iconPaths.js";

function createIcon(name) {
  return defineComponent({
    name,
    setup() {
      return () => h(PdIcon, { name });
    },
  });
}

export const Bottom = createIcon("Bottom");
export const Check = createIcon("Check");
export const Clock = createIcon("Clock");
export const Collection = createIcon("Collection");
export const CollectionTag = createIcon("CollectionTag");
export const CopyDocument = createIcon("CopyDocument");
export const DataAnalysis = createIcon("DataAnalysis");
export const DataLine = createIcon("DataLine");
export const Delete = createIcon("Delete");
export const Document = createIcon("Document");
export const DocumentAdd = createIcon("DocumentAdd");
export const Download = createIcon("Download");
export const Files = createIcon("Files");
export const FolderOpened = createIcon("FolderOpened");
export const Grid = createIcon("Grid");
export const Hide = createIcon("Hide");
export const Lock = createIcon("Lock");
export const Picture = createIcon("Picture");
export const Plus = createIcon("Plus");
export const Postcard = createIcon("Postcard");
export const Printer = createIcon("Printer");
export const RefreshLeft = createIcon("RefreshLeft");
export const RefreshRight = createIcon("RefreshRight");
export const Search = createIcon("Search");
export const Setting = createIcon("Setting");
export const Tickets = createIcon("Tickets");
export const Top = createIcon("Top");
export const Unlock = createIcon("Unlock");
export const View = createIcon("View");
export const ZoomIn = createIcon("ZoomIn");
export const ZoomOut = createIcon("ZoomOut");

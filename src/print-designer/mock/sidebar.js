import { Collection, CopyDocument, DataAnalysis, Document } from "../ui/icons.js";

export const sidebarTabs = [
  { key: "insert", label: "插入", icon: Collection },
  { key: "pages", label: "页面", icon: Document },
  { key: "layers", label: "图层", icon: CopyDocument },
  { key: "data", label: "数据", icon: DataAnalysis },
];

export const sidebarSections = [
  { key: "insert", eyebrow: "Starter Kit", title: "插入" },
  { key: "pages", eyebrow: "Document", title: "页面" },
  { key: "layers", eyebrow: "Hierarchy", title: "图层" },
  { key: "data", eyebrow: "Binding", title: "数据" },
];

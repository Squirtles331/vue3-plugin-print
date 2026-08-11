import { PdMessage, PdMessageBox, registerPrintDesignerUi } from "./index.js";

export function registerElementPlusComponents(app) {
  registerPrintDesignerUi(app);
}

export const ElMessage = PdMessage;
export const ElMessageBox = PdMessageBox;

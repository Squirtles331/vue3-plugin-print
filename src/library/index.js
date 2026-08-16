import "../styles/library.scss";
import PrintTemplateStudio from "../print-designer/index.vue";
import { registerPrintDesignerUi } from "../print-designer/ui/index.js";

export { PrintTemplateStudio };
export { createLocalTemplateRepository, createRestTemplateRepository } from "../print-designer/template/templateRepository.js";
export { createLocalRuntimeDataDraftRepository } from "../print-designer/template/runtimeDataDraftRepository.js";
export {
  TEMPLATE_SCHEMA_VERSION,
  createBlankTemplateDocument,
  createPublishReadyTemplatePayload,
  serializeTemplateDocument,
  validateTemplateDocument,
} from "../print-designer/template/templateDocument.js";

const PrintTemplateStudioPlugin = {
  install(app) {
    registerPrintDesignerUi(app);
    app.component("PrintTemplateStudio", PrintTemplateStudio);
  },
};

export default PrintTemplateStudioPlugin;

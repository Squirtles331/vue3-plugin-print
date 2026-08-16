import type { App, Plugin } from "vue";
import "./styles/library.scss";
import PrintTemplateStudioRuntime from "./print-designer/index.vue";
import { registerPrintDesignerUi } from "./print-designer/ui/index.js";
import type { PrintTemplateStudioComponent } from "./print-designer/types.js";

const PrintTemplateStudio: PrintTemplateStudioComponent = PrintTemplateStudioRuntime as unknown as PrintTemplateStudioComponent;
export type { PrintElementType, PrintPolicy, PrintTemplateStudioErrorPayload, PrintTemplateStudioInstance, PrintTemplateStudioProps, RuntimeDataDraftRepository, TemplateDocument, TemplateElement, TemplateGroup, TemplateIssue, TemplateMeta, TemplatePage, TemplatePageSettings, TemplateRepository, TemplateResult, } from "./print-designer/types.js";
export { PrintTemplateStudio };
export { createLocalTemplateRepository, createRestTemplateRepository } from "./print-designer/template/templateRepository.js";
export { createLocalRuntimeDataDraftRepository } from "./print-designer/template/runtimeDataDraftRepository.js";
export { TEMPLATE_SCHEMA_VERSION, createBlankTemplateDocument, createPublishReadyTemplatePayload, serializeTemplateDocument, validateTemplateDocument, } from "./print-designer/template/templateDocument.js";
const PrintTemplateStudioPlugin: Plugin = {
    install(app: App) {
        registerPrintDesignerUi(app);
        app.component("PrintTemplateStudio", PrintTemplateStudio);
    },
};
export default PrintTemplateStudioPlugin;

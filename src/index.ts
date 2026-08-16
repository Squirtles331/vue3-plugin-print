import type { App, Plugin } from 'vue'
import type { PrintTemplateStudioComponent } from './print-designer/types.js'
import PrintTemplateStudioRuntime from './print-designer/index.vue'
import { registerPrintDesignerUi } from './print-designer/ui/index.js'
import './styles/library.scss'

const PrintTemplateStudio: PrintTemplateStudioComponent = PrintTemplateStudioRuntime as unknown as PrintTemplateStudioComponent
export { createLocalRuntimeDataDraftRepository } from './print-designer/template/runtimeDataDraftRepository.js'
export { PrintTemplateStudio }
export { createBlankTemplateDocument, createPublishReadyTemplatePayload, serializeTemplateDocument, TEMPLATE_SCHEMA_VERSION, validateTemplateDocument } from './print-designer/template/templateDocument.js'
export { createLocalTemplateRepository, createRestTemplateRepository } from './print-designer/template/templateRepository.js'
export type { PrintElementType, PrintPolicy, PrintTemplateStudioErrorPayload, PrintTemplateStudioInstance, PrintTemplateStudioProps, RuntimeDataDraftRepository, TemplateDocument, TemplateElement, TemplateGroup, TemplateIssue, TemplateMeta, TemplatePage, TemplatePageSettings, TemplateRepository, TemplateResult } from './print-designer/types.js'
const PrintTemplateStudioPlugin: Plugin = {
  install(app: App) {
    registerPrintDesignerUi(app)
    app.component('PrintTemplateStudio', PrintTemplateStudio)
  },
}
export default PrintTemplateStudioPlugin

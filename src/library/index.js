import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import "../styles/library.scss";
import PrintTemplateStudio from "../print-designer/index.vue";

export { PrintTemplateStudio };
export { createLocalTemplateRepository, createRestTemplateRepository } from "../print-designer/template/templateRepository.js";
export {
  TEMPLATE_SCHEMA_VERSION,
  createBlankTemplateDocument,
  createPublishReadyTemplatePayload,
  migrateTemplateDocument,
  serializeTemplateDocument,
  validateTemplateDocument,
} from "../print-designer/template/templateDocument.js";

const PrintTemplateStudioPlugin = {
  install(app) {
    if (!app._context.components.ElButton) {
      app.use(ElementPlus);
    }
    for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
      if (!app._context.components[name]) {
        app.component(name, component);
      }
    }
    app.component("PrintTemplateStudio", PrintTemplateStudio);
  },
};

export default PrintTemplateStudioPlugin;

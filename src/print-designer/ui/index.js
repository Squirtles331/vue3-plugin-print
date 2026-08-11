import PdButton from "./primitives/PdButton.vue";
import PdConfirm from "./primitives/PdConfirm.vue";
import PdDialog from "./primitives/PdDialog.vue";
import PdIcon from "./primitives/PdIcon.vue";
import PdInput from "./primitives/PdInput.vue";
import PdInputNumber from "./primitives/PdInputNumber.vue";
import PdOption from "./primitives/PdOption.vue";
import PdOptionGroup from "./primitives/PdOptionGroup.vue";
import PdRadio from "./primitives/PdRadio.vue";
import PdRadioGroup from "./primitives/PdRadioGroup.vue";
import PdSelect from "./primitives/PdSelect.vue";
import PdSwitch from "./primitives/PdSwitch.vue";
import PdTabPane from "./primitives/PdTabPane.vue";
import PdTabs from "./primitives/PdTabs.vue";

export { PdMessage, PdMessageBox } from "./feedback.js";
export * from "./icons.js";

const PRINT_DESIGNER_COMPONENTS = [
  ["PdButton", PdButton],
  ["PdConfirm", PdConfirm],
  ["PdDialog", PdDialog],
  ["PdIcon", PdIcon],
  ["PdInput", PdInput],
  ["PdInputNumber", PdInputNumber],
  ["PdOption", PdOption],
  ["PdOptionGroup", PdOptionGroup],
  ["PdRadio", PdRadio],
  ["PdRadioGroup", PdRadioGroup],
  ["PdSelect", PdSelect],
  ["PdSwitch", PdSwitch],
  ["PdTabPane", PdTabPane],
  ["PdTabs", PdTabs],
];

const LEGACY_ELEMENT_ALIASES = [
  ["ElButton", PdButton],
  ["ElDialog", PdDialog],
  ["ElIcon", PdIcon],
  ["ElInput", PdInput],
  ["ElInputNumber", PdInputNumber],
  ["ElOption", PdOption],
  ["ElOptionGroup", PdOptionGroup],
  ["ElPopconfirm", PdConfirm],
  ["ElRadio", PdRadio],
  ["ElRadioGroup", PdRadioGroup],
  ["ElSelect", PdSelect],
  ["ElSwitch", PdSwitch],
  ["ElTabPane", PdTabPane],
  ["ElTabs", PdTabs],
];

export function registerPrintDesignerUi(app) {
  for (const [name, component] of [...PRINT_DESIGNER_COMPONENTS, ...LEGACY_ELEMENT_ALIASES]) {
    if (app._context.components[name]) {
      continue;
    }
    app.component(name, component);
  }
}

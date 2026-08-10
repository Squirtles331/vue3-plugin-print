import {
  ElButton,
  ElDialog,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElOptionGroup,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
  ElTabPane,
  ElTabs,
} from "element-plus";

import "element-plus/es/components/base/style/css";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/icon/style/css";
import "element-plus/es/components/input/style/css";
import "element-plus/es/components/input-number/style/css";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
import "element-plus/es/components/option/style/css";
import "element-plus/es/components/option-group/style/css";
import "element-plus/es/components/radio/style/css";
import "element-plus/es/components/radio-group/style/css";
import "element-plus/es/components/select/style/css";
import "element-plus/es/components/switch/style/css";
import "element-plus/es/components/tab-pane/style/css";
import "element-plus/es/components/tabs/style/css";

const ELEMENT_PLUS_COMPONENTS = [
  ElButton,
  ElDialog,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElOption,
  ElOptionGroup,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
  ElTabPane,
  ElTabs,
];

export function registerElementPlusComponents(app) {
  for (const component of ELEMENT_PLUS_COMPONENTS) {
    const name = component?.name;

    if (!name || app._context.components[name]) {
      continue;
    }

    app.component(name, component);
  }
}

export { ElMessage, ElMessageBox };

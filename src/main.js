import { createPinia } from "pinia";
import { createApp } from "vue";
import "./styles/demo.scss";
import App from "./App.vue";
import { registerElementPlusComponents } from "./print-designer/ui/elementPlus.js";

const app = createApp(App);

app.use(createPinia());
registerElementPlusComponents(app);
app.mount("#app");

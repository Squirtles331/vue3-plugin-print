import App from './App.vue'
import { registerPrintDesignerUi } from './print-designer/ui/index.js'
import './styles/demo.scss'
import './styles/library.scss'

const app = createApp(App)
app.use(createPinia())
registerPrintDesignerUi(app)
app.mount('#app')

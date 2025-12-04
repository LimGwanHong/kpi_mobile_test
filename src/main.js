import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/routerIndex'

// Bootstrap import
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 스타일 import
import './assets/styles/variables.css'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

// Pinia를 먼저 등록 (axios 인터셉터에서 사용하기 위해)
app.use(pinia)
app.use(router)

// Pinia 인스턴스를 export (axios 인터셉터에서 사용)
export { pinia }

app.mount('#app')


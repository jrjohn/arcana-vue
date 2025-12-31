// Must be first import for InversifyJS decorator metadata
import 'reflect-metadata'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18nPlugin } from '@/domain/services/i18n.service'
import { errorBoundaryPlugin } from '@/core/plugins/error-boundary.plugin'

import 'bootstrap/scss/bootstrap.scss'
import '@/styles/main.scss'

// Import DI container to ensure services are registered
import '@/core/di'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18nPlugin)
app.use(errorBoundaryPlugin)

app.mount('#app')

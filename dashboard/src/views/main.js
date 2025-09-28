  import { createApp } from 'vue'
  import { createPinia } from 'pinia'
  import App from './App.vue'
  import router from './router'
  import '@fortawesome/fontawesome-free/css/all.css'
  import { useAuthStore } from './stores/auth'

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // Initialize auth store and check authentication status
  const authStore = useAuthStore()
  authStore.checkAuthStatus()

  app.mount('#app')
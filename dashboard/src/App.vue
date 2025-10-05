
<template>
  <div id="app-container">
    <HorizontalNavbar v-if="isAuthenticated" />
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import HorizontalNavbar from '@/components/HorizontalNavbar.vue'

export default {
  name: 'App',
  components: {
    HorizontalNavbar,
  },
  setup() {
    const auth = useAuthStore()
    const isAuthenticated = computed(() => auth.isLoggedIn)

    return { isAuthenticated }
  },
}
</script>

<style>
#app-container {
  font-family: Inter, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #004b89;
  color: #fff;
  display: flex;
  max-height: 100vh;
  overflow: auto;
  padding-left: 60px;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
}
#app {
  display: flex;
  align-items: stretch;
}
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>

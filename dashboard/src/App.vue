<template>
  <div id="app">
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
#app {
  font-family: Inter, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #004b89;
  color: #fff;
}
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

input {
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #fff;
  background-color: #0073d5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0087fb;
}
</style>

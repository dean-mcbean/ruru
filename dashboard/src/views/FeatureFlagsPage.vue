<template>
  <div class="dashboard-view">
    <h1>Feature Flags</h1>
    <p>Coming soon.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { refreshAccessToken } from '@/services/auth'
import { jwtDecode } from 'jwt-decode'

function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token)
    if (!decoded.exp) return false
    // exp is in seconds, Date.now() in ms
    return Date.now() >= decoded.exp * 1000
  } catch (e) {
    return true // treat invalid token as expired
  }
}

onMounted(async () => {
  const token = localStorage.getItem('accessToken')
  if (token && isTokenExpired(token)) {
    await refreshAccessToken()
  }
})
</script>

<style scoped>
.dashboard-view {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 32px 64px;
  overflow: auto;
  max-height: 100vh;
  background-color: #124875;
  align-self: stretch;
}
</style>

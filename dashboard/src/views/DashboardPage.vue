<template>
  <div class="dashboard-view">
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard, {{ name }}!</p>
    <router-link to="/protected">Go to Protected Page</router-link>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { handleLogout, refreshAccessToken } from '@/services/auth'
import { jwtDecode } from 'jwt-decode'
const router = useRouter()
let name = 'User' // Placeholder, replace with actual user data if available

async function logout() {
  await handleLogout()
  router.push('/login')
}

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
  if (token) {
    const decoded = jwtDecode(token)
    if (decoded && decoded.email) {
      name = decoded.email.split('.')[0]
    }
  }
  if (token && isTokenExpired(token)) {
    await refreshAccessToken()
  }
})
</script>

<style scoped>
.dashboard-view { 
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 32px 64px;
}
</style>

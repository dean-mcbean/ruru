<template>
  <div class="dashboard-view">
    <h1>Project Management</h1>
    <p>Coming soon.</p>
    <ul>
      <li v-for="project in runnProjects" :key="project.id">
        {{ project.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { refreshAccessToken } from '@/services/auth'
import { jwtDecode } from 'jwt-decode'
import { getRunnProjects } from '@/services/runn/runn'

const runnProjects = ref([])

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
  const { data } = await getRunnProjects()
  runnProjects.value = data
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

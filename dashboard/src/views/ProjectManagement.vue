<template >
  <div class="dashboard-view">
    <h1>Project Management</h1>
    <div class="project-table">
      <div>
        <div class="table-header">
          <h3>Basecamp</h3>
        </div>
        <DataColumn
          :items="basecampProjects"
          :sortFields="['name']"
        >
          <template #default="{ item }">
            <div>
              <strong>{{ item.name }}</strong><br />
            </div>
          </template>
        </DataColumn>
      </div>
      <div>
        <div class="table-header">
          <h3>Runn</h3>
        </div>
        <DataColumn
          :items="runnProjects"
          :sortFields="['name', 'phases']"
        >
          <template #default="{ item }">
            <div>
              <strong>{{ item.name }}</strong><br />
              <VTooltip location="right">
                <template v-slot:activator="{ props }">
                  <VChip v-bind="props">{{ item.phases.length }} Phases</VChip>
                </template>
                <div v-if="item.phases.length === 0">No phases</div>
                <ul v-else>
                  <li v-for="phase in item.phases" :key="phase.id">{{ phase.name }}</li>
                </ul>
              </VTooltip>
            </div>
          </template>
        </DataColumn>
      </div>
      <div>
        <div class="table-header">
          <h3>Hubspot</h3>
        </div>
        <DataColumn
          :items="hubspotProjects"
          :sortFields="['name']"
        >
          <template #default="{ item }">
            <div>
              <strong>{{ item.name }}</strong>
            </div>
          </template>
        </DataColumn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { refreshAccessToken } from '@/services/auth'
import { jwtDecode } from 'jwt-decode'
import { getRunnProjects } from '@/services/runn/runn'
import { getBasecampProjects } from '@/services/basecamp/basecamp'
import DataColumn from '@/components/data/DataColumn.vue'
import { VChip, VTooltip } from 'vuetify/components'

const runnProjects = ref([])
const hubspotProjects = ref([])
const basecampProjects = ref([])

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
  const { data: bcData } = await getBasecampProjects()
  basecampProjects.value = bcData
})
</script>

<style scoped>
h1 {
  margin-bottom: 32px;
}
.dashboard-view {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 32px 64px;
  overflow: auto;
  max-height: 100vh;
  background-color: #adc8e2;
  color: #00213c;
  align-self: stretch;
}
.project-table {
  margin-top: 16px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
.table-header {
  padding: 0 16px;
}
</style>

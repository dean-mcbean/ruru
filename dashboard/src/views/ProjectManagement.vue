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
            <div :style="{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px'
            }">
              <div :style="{ display: 'flex', alignSelf: 'stretch', alignItems: 'flex-start', gap: '8px', justifyContent: 'space-between' }">
                <a target="_blank" :href="`https://app.runn.io/projects/${item.id}`"><strong>{{ item.name }}</strong></a>
                <VMenu open-on-hover>
                  <template #activator="{ props }">
                  <VIcon
                    v-bind="props"
                    icon="mdi-dots-horizontal"
                    size="24"
                    aria-label="More options"
                    class="project-options-btn"
                  />
                  </template>
                  <VList>
                    <VListItem @click="copyRunnToBasecamp(item)" style="cursor: pointer;">
                      <VListItemTitle>Copy to...</VListItemTitle>
                    </VListItem>
                    <VListItem @click="console.log(item)" style="cursor: pointer;">
                      <VListItemTitle>Debug</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
              <VTooltip location="right">
                <template v-slot:activator="{ props }">
                  <VChip v-bind="props">{{ item.phases.length }} Phases</VChip>
                </template>
                <div v-if="item.phases.length === 0">No phases</div>
                <ul v-else style="padding-left: 12px;">
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
    <VSnackbar
      v-model="showSnackbar"
      :timeout="3000"
      :multi-line="true"
    >
      <div>
        <strong>{{ snackbarHeader }}</strong>
        <ul>
          <li v-for="note in snackbarNotifications" :key="note">{{ note }}</li>
        </ul>
      </div>
    </VSnackbar>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getRunnProjects } from '@/services/runn/runn'
import { getBasecampProjects } from '@/services/basecamp/basecamp'
import DataColumn from '@/components/data/DataColumn.vue'
import { VChip, VTooltip, VIcon, VMenu, 
VList, VListItem, VListItemTitle, VSnackbar
 } from 'vuetify/components'
import { createBasecampProject } from '@/services/basecamp/basecamp'

const runnProjects = ref([])
const hubspotProjects = ref([])
const basecampProjects = ref([])

const snackbarNotifications = ref([])
const snackbarHeader = ref('')
const showSnackbar = ref(false)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

async function copyRunnToBasecamp(runnProject) {
  const basecampProject = {
    name: runnProject.name,
    description: runnProject.description,
  }
  snackbarHeader.value = `Creating Basecamp project from "${runnProject.name}"`
  snackbarNotifications.value = ["Setting up project from template..."]
  showSnackbar.value = true
  const createdProject = await createBasecampProject(basecampProject)
  snackbarNotifications.value = [
    "Created project from template.",
    "Adding todolists to project..."
  ]
  const todoSetId = createdProject.data.dock.find(dockItem => dockItem.name === 'todoset').id
  const todoLists = runnProject.phases.map(phase => ({ name: phase.name,
    description: `Start: ${formatDate(phase.startDate)} -> End: ${formatDate(phase.endDate)}`
   }))
   console.log(createdProject, todoLists, todoSetId)
}

onMounted(async () => {
  const [runnRes, basecampRes] = await Promise.all([
    getRunnProjects(),
    getBasecampProjects()
  ])
  runnProjects.value = runnRes.data
  basecampProjects.value = basecampRes.data
})
</script>

<style scoped>
a {
  color: inherit;
  text-decoration: none;
}
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
.project-options-btn {
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;
}
.project-options-btn:hover {
  background-color: #00213c22;
}
</style>

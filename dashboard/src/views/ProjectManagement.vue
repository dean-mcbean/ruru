<template >
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>Project Management</h1>
      <VTextField
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Search projects"
        hide-details
        dense
        style="max-width: 320px;"
      />
    </div>
    <div class="project-table">
      <div>
        <div class="table-header">
          <div class="pill" v-if="basecampLoaded === 'false'">Loading...</div>
          <div class="pill" v-if="basecampLoaded === 'error'" @click="loadBasecampProjects">Error <VIcon icon="mdi-refresh" /></div>
        </div>
        <DataColumn
          title="Basecamp"
          :items="filteredBasecampProjects"
          :sortFields="['name']"
        >
          <template #default="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <a target="_blank" :href="item.app_url"><strong><SearchHighlight :text="item.name" :query="searchQuery" /></strong></a>
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
                    <VListItem @click="navigator.clipboard.writeText(item.app_url)" style="cursor: pointer;">
                      <VListItemTitle>Copy Link</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
              <div class="project-item-content">
                <span>Start Date: {{ item.start_date ? formatDate(new Date(item.start_date)) : 'N/A' }}</span>
                <span>End Date: {{ item.end_date ? formatDate(new Date(item.end_date)) : 'N/A' }}</span>
              </div>
            </div>
          </template>
        </DataColumn>
      </div>
      <div>
        <div class="table-header">
          <div class="pill" v-if="runnLoaded === 'false'">Loading...</div>
          <div class="pill" v-if="runnLoaded === 'error'" @click="loadRunnProjects">Error <VIcon icon="mdi-refresh" /></div>
        </div>
        <DataColumn
          title="Runn"
          :items="filteredRunnProjects"
          :sortFields="['name', 'clientName', 'phases']"
          :page-length="6"
        >
          <template #default="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <a target="_blank" :href="`https://app.runn.io/projects/${item.id}`"><strong><SearchHighlight :text="item.name" :query="searchQuery" /></strong></a>
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
                      <VListItemTitle>Duplicate in Basecamp</VListItemTitle>
                    </VListItem>
                    <VListItem @click="navigator.clipboard.writeText(`https://app.runn.io/projects/${item.id}`)" style="cursor: pointer;">
                      <VListItemTitle>Copy Link</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
              <div class="project-item-content">
                <div><SearchHighlight :text="runnClients.find(c => c.id === item.clientId)?.name || 'N/A'" :query="searchQuery" /></div>
                <div>
                  <template v-if="item.budget !== undefined && item.budget !== null">
                    {{ '$' + item.budget }}
                  </template>
                  <template v-else>
                    <span :style="{
                      fontStyle: 'italic',
                      color: '#AAA'
                    }">No Budget</span>
                  </template>
                </div>
                <div :style="{
                  gridColumn: 'span 2',
                }">
                  <template v-if="item.phases && item.phases.length > 0">
                    {{ item.phases.length }} Phases
                  </template>
                  <template v-else>
                    <span :style="{
                      fontStyle: 'italic',
                      color: '#AAA'
                    }">No Phases</span>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </DataColumn>
      </div>
      <div>
        <div class="table-header">
          <div class="pill" v-if="hubspotLoaded === 'disabled'">Disabled</div>
          <div class="pill" v-if="hubspotLoaded === 'false'">Loading...</div>
          <div class="pill" v-if="hubspotLoaded === 'error'" @click="loadHubspotProjects">Error <VIcon icon="mdi-refresh" /></div>
        </div>
        <DataColumn
          title="Hubspot"
          :items="filteredHubspotProjects"
          :sortFields="['name', 'createdAt', 'updatedAt']"
          :page-length="6"
        >
          <template #default="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <a target="_blank" :href="item.url"><strong><SearchHighlight :text="item.properties.dealname" :query="searchQuery" /></strong></a>
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
                    <VListItem @click="copyHubspotToRunn(item)" style="cursor: pointer;">
                      <VListItemTitle>Duplicate in Runn</VListItemTitle>
                    </VListItem>
                    <VListItem @click="navigator.clipboard.writeText(item.url)" style="cursor: pointer;">
                      <VListItemTitle>Copy Link</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
              <div class="project-item-content">
                <div>{{ item.pipeline == 'SAAS' ? 'Saas' : 'Consulting & Grants' }}</div>
                <div>
                  <template v-if="item.properties.amount">
                    {{ '$' + item.properties.amount }}
                  </template>
                  <template v-else>
                    <span :style="{
                      fontStyle: 'italic',
                      color: '#AAA'
                    }">No Budget</span>
                  </template>
                </div>
                <div :style="{
                  gridColumn: 'span 2',
                }">{{ item.stageLabel.split('(')[0].trim() || 'N/A' }}</div>
              </div>
            </div>
          </template>
        </DataColumn>
      </div>
    </div>
    <!-- Confirmation Modal for copyTo actions -->
    <VDialog v-model="showCopyConfirm" persistent max-width="500px">
      <VCard>
        <VCardTitle>
          Confirm Copy Action
        </VCardTitle>
        <VCardText>
          <div v-if="copyActionInfo">
            <p>You are about to create a project in {{ copyActionInfo.type }} with the following fields:</p>
            <div :style="{padding: '8px', display: 'flex', flexDirection: 'column', border: '1px solid #CCC', borderRadius: '4px', backgroundColor: '#F9F9F9'}">
              <span v-for="(val, key) in copyActionInfo.fields" :key="key">
                <span v-if="val"><strong>{{ key }}:</strong> {{ val }}</span>
              </span>
            </div>
            <div v-if="copyActionInfo.type === 'Basecamp'" style="margin-top: 16px;">
              <VSelect
                v-model="selectedBasecampTemplate"
                :items="basecampTemplates"
                label="Basecamp Template"
                dense
                hide-details
                style="max-width: 220px;"
              />
            </div>
            <div v-if="copyActionInfo.type === 'Runn'" style="margin-top: 16px;">
              <VSelect
                v-model="selectedRunnClient"
                :items="runnClients.map(c => ({ title: c.name, value: c })).toSorted((a, b) => a.title.localeCompare(b.title))"
                label="Runn Client"
                dense
                hide-details
                style="max-width: 220px;"
                :filterable="true"
              />
            </div>
            <p>Are you sure you want to proceed?</p>
          </div>
        </VCardText>
        <VCardActions>
          <VBtn color="primary" @click="confirmCopyAction">Confirm</VBtn>
          <VBtn text @click="cancelCopyAction">Cancel</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
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
// Basecamp template options
const basecampTemplates = [
  { title: 'No Template', value: undefined },
  { title: 'Consulting', value: '44236682' },
  { title: 'Quarterly Update', value: '44817861' },
  { title: 'SaaS', value: '44236730' },
]
const selectedBasecampTemplate = ref(undefined)
const selectedRunnClient = ref({
        "id": 646009,
        "name": "Urban Intelligence",
        "website": null,
        "isArchived": false,
        "references": [],
        "createdAt": "2025-09-16T04:46:38.324Z",
        "updatedAt": "2025-09-16T04:46:38.324Z"
    })
import { ref, reactive, computed } from 'vue'
import { onMounted } from 'vue'
import { getRunnProjects, getRunnClients } from '@/services/runn/runn'
import { getBasecampProjects } from '@/services/basecamp/basecamp'
import { getHubspotDeals } from '@/services/hubspot/hubspot'
import SearchHighlight from '@/components/atoms/SearchHighlight.vue'
import DataColumn from '@/components/data/DataColumn.vue'
import { VIcon, VMenu, 
VList, VListItem, VListItemTitle, VSnackbar, VDialog, VCard, VCardTitle, VCardText, VCardActions, VBtn, VTextField, VSelect
 } from 'vuetify/components'
import { createBasecampProject, createBasecampTodolist } from '@/services/basecamp/basecamp'
import { createRunnProject } from '@/services/runn/runn'
import { notifyOnSlack } from '@/services/slack/slack'
// Modal state and info for copyTo actions
const showCopyConfirm = ref(false)
const copyActionInfo = reactive({
  type: '', // e.g. 'Basecamp', 'Runn'
  source: null, // the source item
  fields: {}, // fields to show in modal
  onConfirm: null // callback
})

function openCopyConfirm(type, source, fields, onConfirm) {
    if (type === 'Basecamp') {
      selectedBasecampTemplate.value = undefined
    }
  copyActionInfo.type = type
  copyActionInfo.source = source
  copyActionInfo.fields = fields
  copyActionInfo.onConfirm = onConfirm
  showCopyConfirm.value = true
}

function confirmCopyAction() {
  showCopyConfirm.value = false
  if (typeof copyActionInfo.onConfirm === 'function') {
    // Pass selected template for Basecamp if relevant
    if (copyActionInfo.type === 'Basecamp') {
      copyActionInfo.onConfirm(selectedBasecampTemplate.value)
    } else {
      copyActionInfo.onConfirm()
    }
  }
}

function cancelCopyAction() {
  showCopyConfirm.value = false
  copyActionInfo.type = ''
  copyActionInfo.source = null
  copyActionInfo.fields = {}
  copyActionInfo.onConfirm = null
}

const runnProjects = ref([])
const runnClients = ref([])
const runnLoaded = ref("false")
const hubspotProjects = ref([])
const hubspotLoaded = ref("disabled")
const basecampProjects = ref([])
const basecampLoaded = ref("false")

const snackbarNotifications = ref([])
const snackbarHeader = ref('')
const showSnackbar = ref(false)

const searchQuery = ref('')

const filteredRunnProjects = computed(() => {
  if (!searchQuery.value) return runnProjects.value
  return runnProjects.value.filter(proj =>
    proj.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (runnClients.value.find(c => c.id === proj.clientId)?.name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const filteredBasecampProjects = computed(() => {
  if (!searchQuery.value) return basecampProjects.value
  return basecampProjects.value.filter(proj =>
    proj.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const filteredHubspotProjects = computed(() => {
  if (!searchQuery.value) return hubspotProjects.value
  return hubspotProjects.value.filter(proj =>
    proj.properties.dealname.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

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
    subscribers: "Chantelle, Ruru",
    todoList: runnProject.phases && runnProject.phases.length > 0 ? runnProject.phases.length + ' phases' : 'No phases'
  }
  openCopyConfirm(
    'Basecamp',
    runnProject,
    basecampProject,
    async () => {
      snackbarHeader.value = `Creating Basecamp project from "${runnProject.name}"`
      const templateKey = basecampTemplates.find(t => t.value === selectedBasecampTemplate.value)?.title || 'None'
      snackbarNotifications.value = ["Setting up project from template... (Template: " + templateKey + ")"]
      showSnackbar.value = true
      // Pass template to API if needed, or just log for now
      const createdProject = await createBasecampProject({ ...basecampProject, template: selectedBasecampTemplate.value }).catch(err => {
        console.error('Error creating Runn project:', err)
        snackbarHeader.value = "Error: " + (err.response?.data?.message || err.message || 'Unknown error')
      })
      snackbarNotifications.value = [
        "Created project from template.",
        "Adding todolists to project..."
      ]
      const todoSetId = createdProject.data.dock.find(dockItem => dockItem.name === 'todoset').id
      const todoLists = runnProject.phases.map(phase => ({ 
        content: phase.name,
        starts_on: phase.startDate,
        due_on: phase.endDate
      }))
      console.log(createdProject, todoLists, todoSetId, 'Template:', selectedBasecampTemplate.value)
      await createBasecampTodolist({
        projectId: createdProject.data.id,
        todolistSetId: todoSetId,
        name: 'Project Phases',
        description: 'Imported from Runn project phases',
        todos: todoLists
      }).catch(err => {
        console.error('Error creating Basecamp todolists:', err)
        snackbarHeader.value = "Error: " + (err.response?.data?.message || err.message || 'Unknown error')
      })
      snackbarNotifications.value.push("Added todolists to project.")
      
      const urlToNewProject = createdProject.data.app_url
      notifyOnSlack(`New Basecamp Project made from template "${templateKey}": ${urlToNewProject}`)
    }
  )
}

async function copyHubspotToRunn(hubspotDeal) {
  const runnProject = {
    name: hubspotDeal.properties.dealname,
    budget: parseFloat(hubspotDeal.properties.amount) || 0,
  }
  openCopyConfirm(
    'Runn',
    hubspotDeal,
    runnProject,
    async () => {
      snackbarHeader.value = `Creating Runn project from "${hubspotDeal.properties.dealname}" for client "${selectedRunnClient.value?.name || 'N/A'}"`
      snackbarNotifications.value = []
      showSnackbar.value = true
      const newRunnProject = await createRunnProject(runnProject.name, runnProject.budget, runnProject.managerIds, selectedRunnClient.value.id).catch(err => {
        console.error('Error creating Runn project:', err)
        snackbarHeader.value = "Error: " + (err.response?.data?.message || err.message || 'Unknown error')
      })
      snackbarNotifications.value.push("Created Runn project.")

      const urlToNewProject = `https://app.runn.io/projects/${newRunnProject.data.id}`
      notifyOnSlack(`New Runn Project for client "${selectedRunnClient.value?.name || 'N/A'}": ${urlToNewProject}`)
    }
  )
}

const loadRunnProjects = async () => {
  try {
    runnLoaded.value = "false"
    const res = await getRunnProjects()
    // Filter out clientId for internal management projects
    const clients = await getRunnClients()
    runnClients.value = clients.data
    runnProjects.value = res.data.filter(proj => !proj.isArchived && proj.clientId !== 646009).map(proj => {
      // Map client names
      const client = clients.data.find(c => c.id === proj.clientId)
      return {
        ...proj,
        clientName: client ? client.name : 'N/A'
      }
    })
    runnLoaded.value = "true"
  } catch (err) {
    console.error('Error fetching Runn projects:', err)
    runnLoaded.value = "error"
  }
}
const loadBasecampProjects = async () => {
  try {
    basecampLoaded.value = "false"
    const res = await getBasecampProjects()
    // Filter out a few non-project projects, such as Bug tracking etc
    basecampProjects.value = res.data.filter(proj => ![44041429, 44023898, 44023863, 44023562].includes(proj.id))
    basecampLoaded.value = "true"
  } catch (err) {
    console.error('Error fetching Basecamp projects:', err)
    basecampLoaded.value = "error"
  }
}
const loadHubspotProjects = async () => {
  try {
    hubspotLoaded.value = "false"
    const res = await getHubspotDeals()
    hubspotProjects.value = res
    hubspotLoaded.value = "true"
  } catch (err) {
    console.error('Error fetching Hubspot deals:', err)
    hubspotLoaded.value = "error"
  }
}

onMounted(async () => {
  loadRunnProjects()
  loadBasecampProjects()
  loadHubspotProjects()
})
</script>

<style scoped>
a {
  color: inherit;
  text-decoration: none;
}
h1 {
  margin-bottom: 8px;
}
.dashboard-view {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 48px;
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
  flex-grow: 1;
}
.table-header {
  padding: 0 16px;
  display: flex;
  align-items: center;
}
.table-header .pill {
  background-color: #00213c;
  border-radius: 20px;
  padding: 2px 12px;
  margin-left: 12px;
  font-size: 0.8em;
  opacity: 0.5;
  color: #fff;
}
.project-options-btn {
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;
}
.project-options-btn:hover {
  background-color: #00213c22;
}
/* ProjectManagement.vue custom classes for inline style replacement */
.project-item-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 60px;
}
.project-item-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  justify-content: space-between;
  background-color: #adc8e240;
  padding: 8px 12px;
  line-height: 1.2;
}
.project-item-header a:hover {
  text-decoration: underline;
}
.project-item-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  line-height: 1.2;
  font-size: 0.9em;
}
.project-item-content>* {
  padding: 6px 12px;
  flex-grow: 1;
  border-right: 1px solid #00213c10;
  border-bottom: 1px solid #00213c20;
  white-space: nowrap;
  color: #000D;
}
.phases-list {
  padding-left: 12px;
}
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.v-list {
  padding: 0;
}
</style>
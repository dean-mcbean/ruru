<template >
  <div class="dashboard-view">
    <h1>Project Management</h1>
    <div class="project-table">
      <div>
        <div class="table-header">
          <h3>Basecamp</h3>
          <div class="pill" v-if="basecampLoaded === 'false'">Loading...</div>
          <div class="pill" v-if="basecampLoaded === 'error'" @click="loadBasecampProjects">Error <VIcon icon="mdi-refresh" /></div>
        </div>
        <DataColumn
          :items="basecampProjects"
          :sortFields="['name']"
        >
          <template #default="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <strong>{{ item.name }}</strong>
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
                    <VListItem @click="console.log(item)" style="cursor: pointer;">
                      <VListItemTitle>Debug</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
            </div>
          </template>
          <template #details="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <strong>{{ item.name }}</strong><br />
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
          <h3>Runn</h3>
          <div class="pill" v-if="runnLoaded === 'false'">Loading...</div>
          <div class="pill" v-if="runnLoaded === 'error'" @click="loadRunnProjects">Error <VIcon icon="mdi-refresh" /></div>
        </div>
        <DataColumn
          :items="runnProjects"
          :sortFields="['name', 'phases']"
        >
          <template #default="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
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
                      <VListItemTitle>Copy to Basecamp</VListItemTitle>
                    </VListItem>
                    <VListItem @click="console.log(item)" style="cursor: pointer;">
                      <VListItemTitle>Debug</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
            </div>
          </template>
          <template #details="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <h3>{{ item.name }}</h3>
              </div>
              <div class="project-item-content">
                <template v-if="item.phases && item.phases.length > 0">
                  <b>Phases:</b>
                  <ul>
                    <li v-for="phase in item.phases" :key="phase.id" :style="{ marginLeft: '24px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }">
                      {{ phase.name }}
                    </li>
                  </ul>
                </template>
                <template v-else>
                  <i>No Phases</i>
                </template>
              </div>
            </div>
          </template>
        </DataColumn>
      </div>
      <div>
        <div class="table-header">
          <h3>Hubspot</h3>
          <div class="pill" v-if="hubspotLoaded === 'disabled'">Disabled</div>
          <div class="pill" v-if="hubspotLoaded === 'false'">Loading...</div>
          <div class="pill" v-if="hubspotLoaded === 'error'" @click="loadHubspotProjects">Error <VIcon icon="mdi-refresh" /></div>
        </div>
        <DataColumn
          :items="hubspotProjects"
          :sortFields="['name', 'createdAt', 'updatedAt']"
        >
          <template #default="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <strong>{{ item.properties.dealname }}</strong>
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
                      <VListItemTitle>Copy to Runn</VListItemTitle>
                    </VListItem>
                    <VListItem @click="console.log(item)" style="cursor: pointer;">
                      <VListItemTitle>Debug</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
            </div>
          </template>
          <template #details="{ item }">
            <div class="project-item-column">
              <div class="project-item-header">
                <h3>{{ item.properties.dealname }}</h3>
              </div>
              <div class="project-item-content">
                <span>Created: {{ formatDateTime(item.createdAt) || 'N/A' }}</span>
                <span>Last Updated: {{ formatDateTime(item.updatedAt) || 'N/A' }}</span>
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
                <strong>{{ key }}:</strong> {{ val }}
              </span>
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
import { ref, reactive } from 'vue'
import { onMounted } from 'vue'
import { getRunnProjects } from '@/services/runn/runn'
import { getBasecampProjects } from '@/services/basecamp/basecamp'
import { getHubspotDeals } from '@/services/hubspot/hubspot'
import DataColumn from '@/components/data/DataColumn.vue'
import { VIcon, VMenu, 
VList, VListItem, VListItemTitle, VSnackbar, VDialog, VCard, VCardTitle, VCardText, VCardActions, VBtn
 } from 'vuetify/components'
import { createBasecampProject } from '@/services/basecamp/basecamp'
import { createRunnProject } from '@/services/runn/runn'
import { notifyOnSlack } from '@/services/slack/slack'
// Modal state and info for copyTo actions
const showCopyConfirm = ref(false)
const copyActionInfo = reactive({
  type: '', // e.g. 'RunnToBasecamp', 'HubspotToRunn'
  source: null, // the source item
  fields: {}, // fields to show in modal
  onConfirm: null // callback
})

function openCopyConfirm(type, source, fields, onConfirm) {
  copyActionInfo.type = type
  copyActionInfo.source = source
  copyActionInfo.fields = fields
  copyActionInfo.onConfirm = onConfirm
  showCopyConfirm.value = true
}

function confirmCopyAction() {
  showCopyConfirm.value = false
  if (typeof copyActionInfo.onConfirm === 'function') {
    copyActionInfo.onConfirm()
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
const runnLoaded = ref("false")
const hubspotProjects = ref([])
const hubspotLoaded = ref("disabled")
const basecampProjects = ref([])
const basecampLoaded = ref("false")

const snackbarNotifications = ref([])
const snackbarHeader = ref('')
const showSnackbar = ref(false)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

function formatDateTime(date = new Date()) {
  // Extract parts
  let month = date.getMonth() + 1; // months are 0-based
  let day = date.getDate();
  let year = date.getFullYear() % 100; // last two digits

  let hours = date.getHours();
  let minutes = date.getMinutes();

  // AM/PM logic
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 → 12

  // Pad with leading zeros
  month = month.toString().padStart(2, '0');
  day = day.toString().padStart(2, '0');
  year = year.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');

  return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
}

async function copyRunnToBasecamp(runnProject) {
  const basecampProject = {
    name: runnProject.name,
    description: runnProject.description,
  }
  openCopyConfirm(
    'RunnToBasecamp',
    runnProject,
    basecampProject,
    async () => {
      snackbarHeader.value = `Creating Basecamp project from "${runnProject.name}"`
      snackbarNotifications.value = ["Setting up project from template..."]
      showSnackbar.value = true
      const createdProject = await createBasecampProject(basecampProject).catch(err => {
        console.error('Error creating Runn project:', err)
        snackbarHeader.value = "Error: " + (err.response?.data?.message || err.message || 'Unknown error')
      })
      snackbarNotifications.value = [
        "Created project from template.",
        "Adding todolists to project..."
      ]
      const todoSetId = createdProject.data.dock.find(dockItem => dockItem.name === 'todoset').id
      const todoLists = runnProject.phases.map(phase => ({ name: phase.name,
        description: `Start: ${formatDate(phase.startDate)} -> End: ${formatDate(phase.endDate)}`
      }))
      console.log(createdProject, todoLists, todoSetId)
      
      const urlToNewProject = createdProject.data.app_url
      notifyOnSlack(`New Basecamp Project: ${urlToNewProject}`)
    }
  )
}

async function copyHubspotToRunn(hubspotDeal) {
  const runnProject = {
    name: hubspotDeal.properties.dealname,
    budget: parseFloat(hubspotDeal.properties.amount) || 0,
  }
  openCopyConfirm(
    'HubspotToRunn',
    hubspotDeal,
    runnProject,
    async () => {
      snackbarHeader.value = `Creating Runn project from "${hubspotDeal.properties.dealname}"`
      snackbarNotifications.value = []
      showSnackbar.value = true
      const newRunnProject = await createRunnProject(runnProject.name, runnProject.budget, runnProject.managerIds).catch(err => {
        console.error('Error creating Runn project:', err)
        snackbarHeader.value = "Error: " + (err.response?.data?.message || err.message || 'Unknown error')
      })
      snackbarNotifications.value.push("Created Runn project.")

      const urlToNewProject = `https://app.runn.io/projects/${newRunnProject.data.id}`
      notifyOnSlack(`New Runn Project: ${urlToNewProject}`)
    }
  )
}

const loadRunnProjects = async () => {
  try {
    runnLoaded.value = "false"
    const res = await getRunnProjects()
    // Filter out clientId for internal management projects
    runnProjects.value = res.data.filter(proj => !proj.isArchived && proj.clientId !== 646009)
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
}
.project-item-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  justify-content: space-between;
  background-color: #adc8e240;
  padding: 8px 12px;
}
.project-item-content {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.2;
}
.phases-list {
  padding-left: 12px;
}
</style>
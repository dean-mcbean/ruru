<template>
  <div class="data-column">
    <div class="controls">
      <button v-if="sortField" @click="toggleSort">
        <VIcon>{{ sortAsc ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</VIcon>
      </button>
      <VSelect
        v-if="sortFields.length"
        v-model="sortField"
        :items="sortFields"
        :density="'compact'"
        variant="outlined"
        label="Sort by"
        hide-details
      />
      <input
        v-if="filterFields.length"
        v-model="filterValue"
        :placeholder="`Filter ${filterField}`"
        class="filter-input"
      />
    </div>
    <div 
      v-for="item in paginatedItems"
      :key="item.id || item[sortField] || JSON.stringify(item)">
      <VTooltip :location="computedTooltipLocation">
        <template v-slot:activator="{ props }">
          <VCard
            v-bind="props"
            class="item-box"
          >
            <slot :item="item">{{ item[sortField] || JSON.stringify(item) }}</slot>
          </VCard>
        </template>
        <VCard
          class="item-tooltip"
        >
          <slot name="details" :item="item">{{ item[sortField] || JSON.stringify(item) }}</slot>
        </VCard>
      </VTooltip>
    </div>
    <div v-if="pageCount > 1" class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
      <span>Page {{ currentPage }} / {{ pageCount }}</span>
      <button @click="nextPage" :disabled="currentPage === pageCount">Next</button>
    </div>
  </div>
</template>

<script setup>
import { VCard, VSelect, VIcon, VTooltip } from 'vuetify/components'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  sortFields: {
    type: Array,
    default: () => [],
  },
  filterFields: {
    type: Array,
    default: () => [],
  },
  tooltipLocation: {
    type: String,
    default: 'auto-right-to-left',
    validator: v => ['left', 'right', 'top', 'bottom', 'auto-right-to-left'].includes(v)
  },
  pageLength: {
    type: Number,
    default: 10,
  },
})

const sortField = ref(props.sortFields[0] || '')
const filterField = ref(props.filterFields[0] || '')
const sortAsc = ref(true)
const filterValue = ref('')

function toggleSort() {
  sortAsc.value = !sortAsc.value
}

const filteredAndSortedItems = computed(() => {
  let result = props.items
  if (filterValue.value) {
    result = result.filter(item =>
      String(item[filterField.value] ?? '')
        .toLowerCase()
        .includes(filterValue.value.toLowerCase())
    )
  }
  if (sortField.value) {
    result = result.slice().sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      if (aVal === bVal) return 0
      if (sortAsc.value) return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
  }
  return result
})

const currentPage = ref(1)

const pageCount = computed(() => {
  return Math.max(1, Math.ceil(filteredAndSortedItems.value.length / props.pageLength))
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.pageLength
  const end = start + props.pageLength
  return filteredAndSortedItems.value.slice(start, end)
})

function nextPage() {
  if (currentPage.value < pageCount.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

// Reset to first page if filter/sort changes
watch(filteredAndSortedItems, () => {
  currentPage.value = 1
})
import { ref, computed, defineProps, watch } from 'vue'

// Compute the tooltip location: if the column is on the right, use 'left', else use the provided/default
const computedTooltipLocation = computed(() => {
  if (props.tooltipLocation === 'auto-right-to-left') {
    if (typeof window !== 'undefined') {
      const el = document.querySelector('.data-column')
      if (el) {
        const rect = el.getBoundingClientRect()
        console.log('Tooltip location check:', rect, window.innerWidth, window.innerWidth - rect.right)
        if (window.innerWidth - rect.right < 100) {
          return 'left'
        }
      }
    }
    return 'right'
  }
  return props.tooltipLocation
})
</script>

<style scoped>
.data-column {
  border-radius: 8px;
  padding: 1rem;
  padding-top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.controls {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 0.5rem;
  padding: 4px;
  padding-bottom: 8px;
}
.filter-input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.item-box {
  margin-bottom: 2px;
  background-color: #fff;
  overflow: hidden;
}
.item-tooltip {
  margin-bottom: 2px;
  background-color: #fff;
  overflow: hidden;
  max-width: 320px;
  width: 320px;
}
.v-select {
  max-width: 150px;
}
.v-select ::v-deep .v-field__input {
  padding: 0px;
  min-height: 24px;
  flex-direction: row-reverse;
}
.v-select ::v-deep .v-field__outline {
  display: none;
}
.v-tooltip ::v-deep .v-overlay__content {
  background: none;
  color: initial;
  padding: 0;
}

.pagination-controls {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
  margin-top: 16px;
  flex-grow: 1;
  padding-bottom: 16px;
}
.pagination-controls button {
  background-color: #f0f0f0;
  border: none;
  padding: 4px 8px;
  margin-bottom: -4px;
  border-radius: 4px;
  cursor: pointer;
}
.pagination-controls button:disabled {
  background-color: #e0e0e0;
  opacity: 0.4;
  cursor: not-allowed;
}

</style>
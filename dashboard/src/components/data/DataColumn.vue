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
    <VCard
      v-for="item in filteredAndSortedItems"
      :key="item.id || item[sortField] || JSON.stringify(item)"
      class="item-box"
    >
      <slot :item="item">{{ item[sortField] || JSON.stringify(item) }}</slot>
    </VCard>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import { VCard, VSelect, VIcon } from 'vuetify/components'

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
</script>

<style scoped>
.data-column {
  border-radius: 8px;
  padding: 1rem;
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
  margin-bottom: 0.5rem;
  background-color: #fff;
  padding: 12px;
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
</style>
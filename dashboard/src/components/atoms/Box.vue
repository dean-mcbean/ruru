<template>
  <div :class="boxClass">
    <slot />
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'tablet',
    validator: value => ['tablet'].includes(value)
  },
})

const boxClass = computed(() => {
  return {
    'tablet': props.variant === 'tablet',
  }
})
</script>

<style scoped>
.tablet {
  padding: 1rem;
  margin: 0;
  background: #003662;
  border-radius: 8px;
}
</style>
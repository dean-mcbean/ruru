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
    default: 'default',
    validator: value => ['default'].includes(value)
  },
})

const boxClass = computed(() => {
  return {
    'default': props.variant === 'default',
  }
})
</script>

<style scoped>
.default {
  padding: 4px 16px;
  margin: 0;
  background: #003662;
  border-radius: 40px;
  border: 1px solid #005f9e;
  display: inline-block;
}
</style>
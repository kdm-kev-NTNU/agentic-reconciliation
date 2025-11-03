<template>
  <div class="p-5 border-b flex items-center justify-between">
    <div>
      <h3 class="text-base font-semibold text-gray-800">{{ title }}</h3>
      <p class="text-sm text-gray-500">{{ subtitle }}</p>
    </div>
    <span :class="badgeClass">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle: string
  count: number
  variant?: 'auto' | 'manual' | 'default'
}>()

const badgeClass = computed(() => {
  const base = 'px-2.5 py-1 rounded-full text-xs font-medium '
  switch (props.variant) {
    case 'auto':
      return base + 'bg-green-100 text-green-800'
    case 'manual':
      return base + 'bg-amber-100 text-amber-800'
    default:
      return base + 'bg-gray-100 text-gray-800'
  }
})
</script>



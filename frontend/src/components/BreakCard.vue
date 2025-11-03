<template>
  <div class="border rounded-xl shadow-sm bg-white p-4 h-full flex flex-col">
    <div class="flex items-start justify-between mb-3">
      <div>
        <div class="text-sm text-gray-500">Break ID</div>
        <div class="text-lg font-semibold text-gray-800">{{ item.break_id }}</div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="item.accepted" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Accepted</span>
        <span v-if="item.priority" :class="priorityBadgeClass(item.priority)">{{ item.priority }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div v-for="detail in details" :key="detail.label">
        <div class="text-gray-500">{{ detail.label }}</div>
        <div class="text-gray-800">{{ detail.value }}</div>
      </div>
      <div>
        <div class="text-gray-500">Action</div>
        <div>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ item.recommended_action || '—' }}
          </span>
        </div>
      </div>
      <div v-if="showAutoApproval">
        <div class="text-gray-500">Auto Approved</div>
        <div :class="item.approved_for_auto_correction ? 'text-green-700' : 'text-gray-500'">
          {{ item.approved_for_auto_correction ? 'Yes' : 'No' }}
        </div>
      </div>
    </div>

    <div v-if="item.rationale" class="mt-4 text-sm text-gray-700">
      <div class="text-gray-500 mb-1">Rationale</div>
      <div class="line-clamp-3" :title="item.rationale">{{ item.rationale }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BreakItem } from '@/types/breaks'

const props = defineProps<{
  item: BreakItem
  showAutoApproval?: boolean
}>()

const details = computed(() => {
  const it = props.item
  const format = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))
  return [
    { label: 'Event Key', value: format(it.coac_event_key) },
    { label: 'Type', value: format(it.break_type) },
    { label: 'Category', value: format(it.category) },
    { label: 'Mapping', value: format(it.mapping_type) },
    { label: 'Confidence', value: it.confidence != null ? `${it.confidence}%` : '—' }
  ]
})

const priorityBadgeClass = (priority: string) => {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium '
  switch ((priority || '').toLowerCase()) {
    case 'high':
      return base + 'bg-red-100 text-red-800'
    case 'medium':
      return base + 'bg-amber-100 text-amber-800'
    case 'low':
      return base + 'bg-green-100 text-green-800'
    default:
      return base + 'bg-gray-100 text-gray-800'
  }
}
</script>

<style scoped>
/* Tailwind line-clamp via plugin may not be enabled; fallback to 3-line clamp */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}
</style>



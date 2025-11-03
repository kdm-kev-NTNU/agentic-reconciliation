<template>
  <div class="bg-white border rounded-xl shadow-sm">
    <div class="p-5 border-b">
      <h2 class="text-lg font-semibold text-gray-800">Breaks Summary</h2>
      <p class="text-sm text-gray-500 mt-1">Overview of identified breaks</p>
    </div>
    <div class="p-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="rounded-lg border p-4">
          <div class="text-sm text-gray-500">Total breaks</div>
          <div class="text-2xl font-semibold text-gray-800">{{ totalBreaks }}</div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-sm text-gray-500">Auto candidates</div>
          <div class="text-2xl font-semibold text-gray-800">{{ autoDisplay }}</div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-sm text-gray-500">Manual candidates</div>
          <div class="text-2xl font-semibold text-gray-800">{{ manualDisplay }}</div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-sm text-gray-500">Awaiting confirmation</div>
          <div class="text-2xl font-semibold text-gray-800">{{ awaitingLabel }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Summary = {
  total_breaks?: number
  auto_batch_size?: number
  manual_batch_size?: number
  awaiting_user_confirmation?: boolean
} | null

const props = defineProps<{
  summary: Summary
  autoCount?: number
  manualCount?: number
}>()

const totalBreaks = computed(() => props.summary?.total_breaks ?? 0)
const autoDisplay = computed(() => props.summary?.auto_batch_size ?? props.autoCount ?? 0)
const manualDisplay = computed(() => props.summary?.manual_batch_size ?? props.manualCount ?? 0)
const awaitingLabel = computed(() => (props.summary?.awaiting_user_confirmation ? 'Yes' : 'No'))
</script>



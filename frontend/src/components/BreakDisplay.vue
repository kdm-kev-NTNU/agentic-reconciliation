<template>
  <div class="space-y-6">
    <div v-if="autoCandidates.length" class="bg-white border rounded-xl shadow-sm">
      <BreakSectionHeader
        title="Auto candidates"
        subtitle="Proposed automatic fixes"
        :count="autoCandidates.length"
        variant="auto"
      />
      <div class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BreakCard v-for="item in autoCandidates" :key="`auto-${item.break_id}`" :item="item" :show-auto-approval="true" />
        </div>
      </div>
    </div>

    <div v-if="manualCandidates.length" class="bg-white border rounded-xl shadow-sm">
      <BreakSectionHeader
        title="Manual candidates"
        subtitle="Require analyst review"
        :count="manualCandidates.length"
        variant="manual"
      />
      <div class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BreakCard v-for="item in manualCandidates" :key="`manual-${item.break_id}`" :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BreakCard from '@/components/BreakCard.vue'
import BreakSectionHeader from '@/components/BreakSectionHeader.vue'
import type { BreakItem } from '@/types/breaks'

defineProps<{
  autoCandidates: BreakItem[]
  manualCandidates: BreakItem[]
}>()
</script>



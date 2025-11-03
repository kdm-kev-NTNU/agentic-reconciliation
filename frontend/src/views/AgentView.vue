<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
    <div class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Identify Breaks</h1>

      <!-- NBIM file upload -->
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">NBIM File</label>
        <input
          type="file"
          @change="handleNbimFile"
          class="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>

      <!-- Custody file upload -->
      <div class="mb-6">
        <label class="block text-gray-700 font-medium mb-2">Custody File</label>
        <input
          type="file"
          @change="handleCustodyFile"
          class="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>

      <!-- Identify Breaks button -->
      <button
        @click="identifyBreaks"
        :disabled="!nbimFile || !custodyFile || isLoading"
        class="w-full py-3 rounded-xl font-semibold text-white transition
               disabled:bg-gray-400 disabled:cursor-not-allowed
               bg-blue-600 hover:bg-blue-700"
      >
        Identify Breaks
      </button>

    </div>

    <div v-if="isLoading" class="mt-4 text-blue-700">Processing…</div>

    <div v-if="errorMessage" class="mt-4 p-3 rounded bg-red-100 text-red-800">{{ errorMessage }}</div>

    <div v-if="responseData" class="mt-6 space-y-6 w-full text-left">
      <BreakSummary v-if="classifiedBreaks"
        :summary="summary"
        :auto-count="autoCandidates.length"
        :manual-count="manualCandidates.length"
      />
      <BreakDisplay
        v-if="classifiedBreaks && (autoCandidates.length || manualCandidates.length)"
        :auto-candidates="autoCandidates"
        :manual-candidates="manualCandidates"
      />

      <details class="bg-gray-50 border rounded-xl p-4">
        <summary class="cursor-pointer text-sm text-gray-600">Show raw JSON</summary>
        <pre class="mt-3 bg-white border rounded p-3 text-xs overflow-auto">{{ formattedResponse }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { requestIdentifyBreaks, getCachedIdentifyBreaks } from '@/services/workflowService'
import BreakDisplay from '@/components/BreakDisplay.vue'
import BreakSummary from '@/components/BreakSummary.vue'

const nbimFile = ref<File | null>(null)
const custodyFile = ref<File | null>(null)

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const responseData = ref<any | null>(null)

const formattedResponse = computed(() =>
  responseData.value ? JSON.stringify(responseData.value, null, 2) : ''
)

const classifiedBreaks = computed(() => {
  const result = responseData.value?.result
  if (!result) return null
  if (result.output_parsed?.classified_breaks) {
    return result.output_parsed.classified_breaks
  }
  if (result.output_text) {
    try {
      const parsed = JSON.parse(result.output_text)
      return parsed?.classified_breaks ?? null
    } catch {
      return null
    }
  }
  return null
})

const summary = computed(() => classifiedBreaks.value?.summary ?? null)
const autoCandidates = computed(() => classifiedBreaks.value?.auto_candidates ?? [])
const manualCandidates = computed(() => classifiedBreaks.value?.manual_candidates ?? [])


const handleNbimFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.item(0)
  if (file) {
    nbimFile.value = file
  }
}

const handleCustodyFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.item(0)
  if (file) {
    custodyFile.value = file
  }
}

const identifyBreaks = async () => {
  if (!nbimFile.value || !custodyFile.value) return

  isLoading.value = true
  errorMessage.value = null
  responseData.value = null

  try {
    const data = await requestIdentifyBreaks(nbimFile.value, custodyFile.value)
    responseData.value = data
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    errorMessage.value = message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const cached = getCachedIdentifyBreaks()
  if (cached) {
    responseData.value = cached
  }
})
</script>

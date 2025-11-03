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

      <div v-if="isLoading" class="mt-4 text-blue-700">Processing…</div>

      <div v-if="errorMessage" class="mt-4 p-3 rounded bg-red-100 text-red-800">{{ errorMessage }}</div>

      <div v-if="responseData" class="mt-4 text-left">
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Response</h2>
        <pre class="bg-gray-100 p-3 rounded text-sm overflow-auto">{{ formattedResponse }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const nbimFile = ref<File | null>(null)
const custodyFile = ref<File | null>(null)

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const responseData = ref<any | null>(null)

const formattedResponse = computed(() =>
  responseData.value ? JSON.stringify(responseData.value, null, 2) : ''
)

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
    const formData = new FormData()
    formData.append('input_as_text', 'Identify breaks between nbim and custody files')
    formData.append('nbim_file', nbimFile.value)
    formData.append('custody_file', custodyFile.value)

    const { data } = await axios.post('http://127.0.0.1:8000/api/run-workflow', formData)
    if (data && data.success === false) {
      throw new Error(data.error || 'Workflow failed')
    }
    responseData.value = data
  } catch (err: unknown) {
    let message = 'Unexpected error'
    if (axios.isAxiosError(err)) {
      const serverData = err.response?.data as any
      if (serverData && typeof serverData === 'object' && 'error' in serverData) {
        message = serverData.error || err.message
      } else {
        message = `${err.message}${err.response ? ` (${err.response.status})` : ''}`
      }
    } else if (err instanceof Error) {
      message = err.message
    }
    errorMessage.value = message
  } finally {
    isLoading.value = false
  }
}
</script>

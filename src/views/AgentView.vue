<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
    <div class="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 text-center">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">🌤 Agent Workflow Test</h1>

      <div v-if="loading" class="text-gray-500 animate-pulse">
        Asking the model: “What is the weather like today?”
      </div>

      <div v-else-if="error" class="text-red-500 mt-4">
        {{ error }}
      </div>

      <div v-else class="text-gray-800 mt-4 whitespace-pre-line">
        {{ response }}
      </div>

      <button
        @click="fetchResponse"
        class="mt-8 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
      >
        Ask Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'


const response = ref('')
const error = ref<string | null>(null)
const loading = ref(true)
const userText = ref('')

async function fetchResponse() {
  if (!userText.value.trim()) {
    error.value = 'Please enter a question first.'
    return
  }

  loading.value = true
  error.value = null
  response.value = ''

}

onMounted(fetchResponse)

</script>

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
        :disabled="!nbimFile || !custodyFile"
        class="w-full py-3 rounded-xl font-semibold text-white transition
               disabled:bg-gray-400 disabled:cursor-not-allowed
               bg-blue-600 hover:bg-blue-700"
      >
        Identify Breaks
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const nbimFile = ref<File | null>(null)
const custodyFile = ref<File | null>(null)

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

const identifyBreaks = () => {
  if (nbimFile.value && custodyFile.value) {
    console.log('NBIM File:', nbimFile.value.name)
    console.log('Custody File:', custodyFile.value.name)
  }
}
</script>

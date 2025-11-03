<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div id="chat" class="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-4"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const publicKey = import.meta.env.VITE_OPENAI_PUBLIC_KEY
  const workflowId = import.meta.env.VITE_WORKFLOW_ID

  // @ts-ignore because chatkit is loaded globally
  window.ChatKit.mount({
    element: document.getElementById('chat'),
    publicKey,
    workflowId,
    theme: 'light',
  })
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
}
</style>

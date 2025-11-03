import { createRouter, createWebHistory } from 'vue-router'
import AgentView from '@/views/AgentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'agent-view',
      component: AgentView,
    },
  ],
})

export default router

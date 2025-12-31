<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import SidebarComponent from '@/presentation/components/layout/SidebarComponent.vue'
import HeaderComponent from '@/presentation/components/layout/HeaderComponent.vue'
import RightPanelComponent from '@/presentation/components/layout/RightPanelComponent.vue'

const sidebarCollapsed = ref(false)
const rightPanelOpen = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleRightPanel() {
  rightPanelOpen.value = !rightPanelOpen.value
}
</script>

<template>
  <div class="app-layout">
    <SidebarComponent :collapsed="sidebarCollapsed" />

    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <HeaderComponent
        @toggle-sidebar="toggleSidebar"
        @toggle-right-panel="toggleRightPanel"
      />

      <main class="page-content">
        <RouterView />
      </main>
    </div>

    <RightPanelComponent :open="rightPanelOpen" @close="rightPanelOpen = false" />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.page-content {
  padding: 1.5rem;
}
</style>

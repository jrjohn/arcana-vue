<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import SidebarComponent from '@/presentation/components/layout/SidebarComponent.vue'
import HeaderComponent from '@/presentation/components/layout/HeaderComponent.vue'
import RightPanelComponent from '@/presentation/components/layout/RightPanelComponent.vue'

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const rightPanelOpen = ref(false)

// Check if mobile (for overlay)
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768
  }
  return false
})

function toggleSidebar() {
  if (isMobile.value) {
    mobileMenuOpen.value = !mobileMenuOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

function toggleRightPanel() {
  rightPanelOpen.value = !rightPanelOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function closeRightPanel() {
  rightPanelOpen.value = false
}
</script>

<template>
  <div class="app-layout">
    <!-- Header (Fixed) -->
    <HeaderComponent
      @toggle-sidebar="toggleSidebar"
      @toggle-right-panel="toggleRightPanel"
    />

    <!-- Sidebar -->
    <SidebarComponent
      :collapsed="sidebarCollapsed"
      :class="{ show: mobileMenuOpen }"
    />

    <!-- Mobile overlay -->
    <div
      v-if="mobileMenuOpen"
      class="sidebar-overlay show"
      @click="closeMobileMenu"
    ></div>

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <main class="page-content">
        <RouterView />
      </main>
    </div>

    <!-- Right Panel -->
    <RightPanelComponent :open="rightPanelOpen" @close="closeRightPanel" />
  </div>
</template>

<style scoped>
/* Component-specific styles are in main.scss */
</style>

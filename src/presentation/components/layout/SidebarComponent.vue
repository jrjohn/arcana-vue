<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/domain/services/i18n.service'
import UserPanelComponent from './UserPanelComponent.vue'
import { navGraph } from '@/router'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const { t } = useI18n()

interface NavItem {
  icon: string
  label: string
  path: string
  action: () => void
}

const navItems = computed<NavItem[]>(() => [
  {
    icon: 'bi-house',
    label: t('nav.home'),
    path: '/home',
    action: () => navGraph.home.navigate()
  },
  {
    icon: 'bi-people',
    label: t('nav.users'),
    path: '/users',
    action: () => navGraph.users.toList()
  },
  {
    icon: 'bi-calendar3',
    label: t('nav.calendar'),
    path: '/calendar',
    action: () => {}
  },
  {
    icon: 'bi-chat-dots',
    label: t('nav.messages'),
    path: '/messages',
    action: () => {}
  },
  {
    icon: 'bi-folder',
    label: t('nav.projects'),
    path: '/projects',
    action: () => {}
  },
  {
    icon: 'bi-list-task',
    label: t('nav.tasks'),
    path: '/tasks',
    action: () => {}
  },
  {
    icon: 'bi-graph-up',
    label: t('nav.analytics'),
    path: '/analytics',
    action: () => {}
  },
  {
    icon: 'bi-gear',
    label: t('nav.settings'),
    path: '/settings',
    action: () => {}
  }
])

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header d-flex align-items-center px-3 py-3">
      <i class="bi bi-hexagon-fill text-primary fs-4"></i>
      <span v-if="!collapsed" class="ms-2 fw-bold text-white fs-5">Arcana</span>
    </div>

    <UserPanelComponent v-if="!collapsed" />

    <nav class="sidebar-nav mt-3">
      <ul class="nav flex-column">
        <li v-for="item in navItems" :key="item.path" class="nav-item">
          <a
            class="nav-link"
            :class="{ active: isActive(item.path) }"
            href="#"
            @click.prevent="item.action"
          >
            <i :class="['bi', item.icon]"></i>
            <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer mt-auto p-3">
      <a href="#" class="nav-link text-danger" @click.prevent>
        <i class="bi bi-box-arrow-left"></i>
        <span v-if="!collapsed" class="nav-text">{{ t('nav.logout') }}</span>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-link.text-danger {
  color: #ef4444 !important;
}

.nav-link.text-danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}
</style>

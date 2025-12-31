<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/domain/services/i18n.service'
import { navGraph } from '@/router'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const { t } = useI18n()

const currentUser = {
  name: 'George Bluth',
  email: 'george.bluth@reqres.in',
  role: 'Administrator',
  status: 'online',
  avatar: 'https://reqres.in/img/faces/1-image.jpg'
}

interface NavItem {
  id: string
  icon: string
  labelKey: string
  route?: string
  action?: () => void
  badge?: number
  badgeClass?: string
  children?: NavItem[]
}

const menuItems = computed<NavItem[]>(() => [
  {
    id: 'home',
    icon: 'bi-house-door',
    labelKey: 'nav.home',
    route: '/home',
    action: () => navGraph.home.navigate()
  },
  {
    id: 'users',
    icon: 'bi-people',
    labelKey: 'nav.users',
    route: '/users',
    action: () => navGraph.users.toList()
  },
  {
    id: 'projects',
    icon: 'bi-folder',
    labelKey: 'nav.projects',
    route: '/projects'
  },
  {
    id: 'tasks',
    icon: 'bi-kanban',
    labelKey: 'nav.tasks',
    route: '/tasks'
  },
  {
    id: 'calendar',
    icon: 'bi-calendar-event',
    labelKey: 'nav.calendar',
    route: '/calendar'
  },
  {
    id: 'messages',
    icon: 'bi-chat-dots',
    labelKey: 'nav.messages',
    route: '/messages',
    badge: 5,
    badgeClass: 'bg-danger'
  },
  {
    id: 'documents',
    icon: 'bi-file-earmark-text',
    labelKey: 'nav.documents',
    route: '/documents'
  },
  {
    id: 'analytics',
    icon: 'bi-graph-up',
    labelKey: 'nav.analytics',
    route: '/analytics'
  },
  {
    id: 'settings',
    icon: 'bi-gear',
    labelKey: 'nav.settings',
    route: '/settings'
  }
])

function isActive(item: NavItem): boolean {
  if (item.route) {
    return route.path.startsWith(item.route)
  }
  return false
}

function handleNavClick(item: NavItem) {
  if (item.action) {
    item.action()
  }
}

function getStatusClass(status: string): string {
  return `status-${status}`
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- User Profile Block -->
    <div class="user-profile-block">
      <div class="user-profile-content">
        <div class="user-avatar-wrapper">
          <img
            :src="currentUser.avatar"
            :alt="currentUser.name"
            class="user-avatar"
          />
          <span
            class="status-indicator"
            :class="getStatusClass(currentUser.status)"
            :title="currentUser.status"
          ></span>
        </div>
        <div v-if="!collapsed" class="user-info">
          <div class="user-name">{{ currentUser.name }}</div>
          <div class="user-email">{{ currentUser.email }}</div>
          <span class="badge user-role-badge">{{ currentUser.role }}</span>
        </div>
      </div>
      <div v-if="!collapsed" class="user-profile-actions">
        <button
          type="button"
          class="btn btn-sm btn-outline-primary w-100"
          :title="t('nav.profile')"
        >
          <i class="bi bi-person me-1"></i>
          {{ t('nav.profile') }}
        </button>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div v-if="!collapsed" class="nav-section-title">{{ t('nav.main.menu') }}</div>
        <a
          v-for="item in menuItems"
          :key="item.id"
          href="#"
          class="nav-link"
          :class="{ active: isActive(item) }"
          :title="collapsed ? t(item.labelKey) : ''"
          @click.prevent="handleNavClick(item)"
        >
          <i :class="[item.icon, 'nav-icon']"></i>
          <span v-if="!collapsed" class="nav-label">{{ t(item.labelKey) }}</span>
          <span
            v-if="!collapsed && item.badge"
            :class="['badge', 'ms-auto', item.badgeClass]"
          >
            {{ item.badge }}
          </span>
          <span
            v-else-if="collapsed && item.badge"
            class="badge-dot"
            :class="item.badgeClass"
          ></span>
        </a>
      </div>
    </nav>

    <!-- Sidebar Footer -->
    <div v-if="!collapsed" class="sidebar-footer">
      <div class="footer-stats">
        <div class="stat-item">
          <i class="bi bi-hdd text-primary"></i>
          <div class="stat-info">
            <div class="stat-label">{{ t('sidebar.storage') }}</div>
            <div class="stat-value">4.2 GB / 10 GB</div>
          </div>
        </div>
        <div class="progress" style="height: 4px;">
          <div
            class="progress-bar bg-primary"
            role="progressbar"
            style="width: 42%"
            aria-valuenow="42"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.badge-dot {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.badge-dot.bg-danger {
  background-color: #dc3545;
}
</style>

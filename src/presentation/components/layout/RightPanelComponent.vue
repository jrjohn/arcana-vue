<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/domain/services/i18n.service'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()
const activeTab = ref<'activity' | 'notifications' | 'settings'>('activity')

const activities = [
  {
    id: 1,
    user: 'Janet Weaver',
    action: 'created a new project',
    time: '2 minutes ago',
    avatar: 'https://reqres.in/img/faces/2-image.jpg'
  },
  {
    id: 2,
    user: 'Emma Wong',
    action: 'completed a task',
    time: '15 minutes ago',
    avatar: 'https://reqres.in/img/faces/3-image.jpg'
  },
  {
    id: 3,
    user: 'Eve Holt',
    action: 'sent you a message',
    time: '1 hour ago',
    avatar: 'https://reqres.in/img/faces/4-image.jpg'
  },
  {
    id: 4,
    user: 'Charles Morris',
    action: 'updated user profile',
    time: '3 hours ago',
    avatar: 'https://reqres.in/img/faces/5-image.jpg'
  }
]

const notifications = [
  {
    id: 1,
    title: 'New user registered',
    message: 'John Doe has joined the team',
    time: '5 minutes ago',
    unread: true
  },
  {
    id: 2,
    title: 'Project completed',
    message: 'Website redesign is now complete',
    time: '1 hour ago',
    unread: true
  },
  {
    id: 3,
    title: 'Meeting reminder',
    message: 'Team standup in 30 minutes',
    time: '2 hours ago',
    unread: false
  }
]

function clearAllActivities() {
  console.log('Clear all activities')
}

function markAllRead() {
  console.log('Mark all notifications as read')
}
</script>

<template>
  <aside class="right-panel" :class="{ open }">
    <div class="panel-header d-flex align-items-center justify-content-between p-3 border-bottom">
      <h6 class="mb-0 fw-semibold">Activity Center</h6>
      <button class="btn btn-link text-dark p-0" @click="emit('close')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs nav-justified">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'activity' }"
          @click="activeTab = 'activity'"
        >
          Activity
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'notifications' }"
          @click="activeTab = 'notifications'"
        >
          Notifications
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'settings' }"
          @click="activeTab = 'settings'"
        >
          Settings
        </button>
      </li>
    </ul>

    <div class="panel-content">
      <!-- Activity Tab -->
      <div v-if="activeTab === 'activity'" class="tab-pane">
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <span class="text-muted small text-uppercase">Recent Activity</span>
          <button class="btn btn-sm btn-link text-danger p-0" @click="clearAllActivities">
            Clear All
          </button>
        </div>
        <div class="activity-list">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="activity-item d-flex gap-3 p-3 border-bottom"
          >
            <img
              :src="activity.avatar"
              :alt="activity.user"
              class="rounded-circle"
              width="40"
              height="40"
            />
            <div>
              <div class="activity-text">
                <span class="fw-semibold">{{ activity.user }}</span>
                <span class="text-muted"> {{ activity.action }}</span>
              </div>
              <small class="text-muted">{{ activity.time }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Tab -->
      <div v-if="activeTab === 'notifications'" class="tab-pane">
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <span class="text-muted small text-uppercase">Notifications</span>
          <button class="btn btn-sm btn-link text-primary p-0" @click="markAllRead">
            Mark All Read
          </button>
        </div>
        <div class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item d-flex gap-3 p-3 border-bottom"
            :class="{ 'bg-light': notification.unread }"
          >
            <div class="notification-icon">
              <i class="bi bi-bell text-primary"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between">
                <span class="fw-semibold">{{ notification.title }}</span>
                <span v-if="notification.unread" class="unread-dot"></span>
              </div>
              <div class="text-muted small">{{ notification.message }}</div>
              <small class="text-muted">{{ notification.time }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-pane p-3">
        <div class="settings-section mb-4">
          <h6 class="text-muted small text-uppercase mb-3">Quick Settings</h6>
          <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" id="darkMode" checked>
            <label class="form-check-label" for="darkMode">Dark Mode</label>
          </div>
          <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" id="notifications" checked>
            <label class="form-check-label" for="notifications">Push Notifications</label>
          </div>
          <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" id="sounds">
            <label class="form-check-label" for="sounds">Sound Effects</label>
          </div>
        </div>
        <div class="settings-section">
          <h6 class="text-muted small text-uppercase mb-3">System Info</h6>
          <div class="card bg-light">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Version</span>
                <span class="fw-semibold">1.0.0</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Last Updated</span>
                <span class="fw-semibold">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nav-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 2px solid transparent;
  color: #6c757d;
  padding: 1rem;
  font-size: 0.875rem;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: transparent;
}

.nav-tabs .nav-link:hover:not(.active) {
  color: #495057;
  border-bottom-color: #e0e0e0;
}

.activity-item:hover,
.notification-item:hover {
  background-color: #f8f9fa;
}

.activity-item:last-child,
.notification-item:last-child {
  border-bottom: none !important;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(13, 110, 253, 0.1);
  border-radius: 50%;
}

.notification-icon i {
  font-size: 1.25rem;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #0d6efd;
  border-radius: 50%;
}
</style>

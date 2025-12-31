<script setup lang="ts">
import { useI18n } from '@/domain/services/i18n.service'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

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
</script>

<template>
  <aside class="right-panel" :class="{ open }">
    <div class="panel-header d-flex align-items-center justify-content-between p-3 border-bottom">
      <h6 class="mb-0 fw-semibold">{{ t('header.notifications') }}</h6>
      <button class="btn btn-link text-dark p-0" @click="emit('close')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div class="panel-content p-3">
      <h6 class="text-muted small mb-3 text-uppercase">Recent Activity</h6>

      <div class="activity-list">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="activity-item d-flex gap-3 mb-3 pb-3 border-bottom"
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
  </aside>
</template>

<style scoped>
.activity-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>

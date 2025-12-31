<script setup lang="ts">
defineProps<{
  type: 'success' | 'danger' | 'warning' | 'info'
  message: string
  dismissible?: boolean
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const icons = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill'
}
</script>

<template>
  <div
    class="alert d-flex align-items-center"
    :class="[
      `alert-${type}`,
      { 'alert-dismissible': dismissible }
    ]"
    role="alert"
  >
    <i :class="['bi', icons[type], 'me-2']"></i>
    <div>{{ message }}</div>
    <button
      v-if="dismissible"
      type="button"
      class="btn-close"
      @click="emit('dismiss')"
    ></button>
  </div>
</template>

<style scoped>
</style>

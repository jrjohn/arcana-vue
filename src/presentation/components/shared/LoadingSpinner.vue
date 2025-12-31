<script setup lang="ts">
import { useI18n } from '@/domain/services/i18n.service'

defineOptions({
  name: 'LoadingSpinner'
})

defineProps<{
  overlay?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="overlay" class="loading-overlay">
    <div class="text-center">
      <div
        class="spinner-border text-primary"
        :class="{
          'spinner-border-sm': size === 'sm',
          'spinner-border-lg': size === 'lg'
        }"
        role="status"
      >
        <span class="visually-hidden">{{ t('common.loading') }}</span>
      </div>
      <div class="mt-2 text-muted">{{ t('common.loading') }}</div>
    </div>
  </div>
  <div v-else class="d-flex justify-content-center align-items-center py-4">
    <div
      class="spinner-border text-primary"
      :class="{
        'spinner-border-sm': size === 'sm',
        'spinner-border-lg': size === 'lg'
      }"
      role="status"
    >
      <span class="visually-hidden">{{ t('common.loading') }}</span>
    </div>
  </div>
</template>

<style scoped>
.spinner-border-lg {
  width: 3rem;
  height: 3rem;
}
</style>

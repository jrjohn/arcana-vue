<script setup lang="ts">
import { useI18n } from '@/domain/services/i18n.service'

defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop fade show"></div>
    <div
      v-if="show"
      class="modal fade show d-block"
      tabindex="-1"
      @click.self="emit('cancel')"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="emit('cancel')"
            ></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="emit('cancel')"
            >
              {{ cancelText ?? t('common.cancel') }}
            </button>
            <button
              type="button"
              class="btn"
              :class="{
                'btn-danger': variant === 'danger',
                'btn-warning': variant === 'warning',
                'btn-primary': variant === 'primary' || !variant
              }"
              @click="emit('confirm')"
            >
              {{ confirmText ?? t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

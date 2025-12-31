<script setup lang="ts">
/**
 * ErrorFallback Component
 * Default fallback UI for error boundary
 * Displays error message with retry button
 */

import { computed } from 'vue'
import { useI18n } from '@/domain/services/i18n.service'

interface Props {
  /** The error that was caught */
  error: Error
  /** Additional error info from Vue */
  errorInfo?: string
  /** Show detailed error in development */
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: import.meta.env.DEV
})

const emit = defineEmits<{
  retry: []
}>()

const { t } = useI18n()

const errorMessage = computed(() => {
  return props.error.message || t('error.unknown')
})

const errorStack = computed(() => {
  if (!props.showDetails) return null
  return props.error.stack ?? null
})

function handleRetry(): void {
  emit('retry')
}

function handleReload(): void {
  window.location.reload()
}

function handleGoHome(): void {
  window.location.href = '/'
}
</script>

<template>
  <div class="error-fallback">
    <div class="error-fallback__container">
      <div class="error-fallback__icon">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>

      <h2 class="error-fallback__title">
        {{ t('error.boundary.title') }}
      </h2>

      <p class="error-fallback__message">
        {{ t('error.boundary.message') }}
      </p>

      <div v-if="showDetails" class="error-fallback__details">
        <details>
          <summary>{{ t('error.boundary.details') }}</summary>
          <pre class="error-fallback__error-message">{{ errorMessage }}</pre>
          <pre v-if="errorInfo" class="error-fallback__error-info">{{ errorInfo }}</pre>
          <pre v-if="errorStack" class="error-fallback__stack">{{ errorStack }}</pre>
        </details>
      </div>

      <div class="error-fallback__actions">
        <button class="btn btn-primary" type="button" @click="handleRetry">
          <i class="bi bi-arrow-clockwise me-2"></i>
          {{ t('error.boundary.retry') }}
        </button>

        <button class="btn btn-outline-secondary" type="button" @click="handleReload">
          <i class="bi bi-arrow-repeat me-2"></i>
          {{ t('error.boundary.reload') }}
        </button>

        <button class="btn btn-outline-secondary" type="button" @click="handleGoHome">
          <i class="bi bi-house me-2"></i>
          {{ t('error.boundary.home') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;

  &__container {
    max-width: 600px;
    text-align: center;
  }

  &__icon {
    font-size: 4rem;
    color: var(--bs-danger);
    margin-bottom: 1.5rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--bs-dark);
  }

  &__message {
    color: var(--bs-secondary);
    margin-bottom: 1.5rem;
  }

  &__details {
    text-align: left;
    margin-bottom: 1.5rem;

    details {
      background: var(--bs-light);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    summary {
      cursor: pointer;
      font-weight: 500;
      margin-bottom: 0.5rem;

      &:hover {
        color: var(--bs-primary);
      }
    }
  }

  &__error-message,
  &__error-info,
  &__stack {
    font-size: 0.75rem;
    background: var(--bs-dark);
    color: var(--bs-light);
    padding: 0.75rem;
    border-radius: 0.25rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin-top: 0.5rem;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }
}
</style>

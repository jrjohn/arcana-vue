<script setup lang="ts">
/**
 * ErrorBoundary Component
 * Catches errors in child component tree and displays fallback UI
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * With custom fallback:
 * <ErrorBoundary>
 *   <template #default>
 *     <YourComponent />
 *   </template>
 *   <template #fallback="{ error, reset }">
 *     <CustomErrorUI :error="error" @retry="reset" />
 *   </template>
 * </ErrorBoundary>
 */

import { ref, onErrorCaptured } from 'vue'
import ErrorFallback from './ErrorFallback.vue'

interface Props {
  /** Custom error handler callback */
  onError?: (error: Error, info: string) => void
  /** Whether to log errors to console */
  logErrors?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  logErrors: true
})

const emit = defineEmits<{
  error: [error: Error, info: string]
  reset: []
}>()

const error = ref<Error | null>(null)
const errorInfo = ref<string>('')

/**
 * Capture errors from child components
 */
onErrorCaptured((err: Error, _instance, info: string) => {
  error.value = err
  errorInfo.value = info

  // Log error if enabled
  if (props.logErrors && import.meta.env.DEV) {
    console.error('ErrorBoundary caught error:', err)
    console.log('Error info:', info)
  }

  // Call custom error handler if provided
  props.onError?.(err, info)

  // Emit error event
  emit('error', err, info)

  // Return false to prevent error from propagating
  return false
})

/**
 * Reset error state to retry rendering
 */
function reset(): void {
  error.value = null
  errorInfo.value = ''
  emit('reset')
}

// Expose for parent components
defineExpose({
  error,
  errorInfo,
  reset
})
</script>

<template>
  <slot v-if="!error" />
  <slot
    v-else
    name="fallback"
    :error="error"
    :error-info="errorInfo"
    :reset="reset"
  >
    <ErrorFallback :error="error" :error-info="errorInfo" @retry="reset" />
  </slot>
</template>

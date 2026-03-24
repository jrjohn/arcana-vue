import { ref, readonly, onMounted, onUnmounted } from 'vue'

/**
 * Network status service - Monitor online/offline status
 */
export function useNetworkStatus() {
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  const wasOffline = ref(false)

  function handleOnline() {
    isOnline.value = true
  }

  function handleOffline() {
    isOnline.value = false
    wasOffline.value = true
  }

  function setup() {
    if (typeof globalThis.window !== 'undefined') {
      globalThis.addEventListener('online', handleOnline)
      globalThis.addEventListener('offline', handleOffline)
    }
  }

  function cleanup() {
    if (typeof globalThis.window !== 'undefined') {
      globalThis.removeEventListener('online', handleOnline)
      globalThis.removeEventListener('offline', handleOffline)
    }
  }

  // Auto setup/cleanup when used in component
  onMounted(setup)
  onUnmounted(cleanup)

  function clearOfflineFlag() {
    wasOffline.value = false
  }

  return {
    isOnline: readonly(isOnline),
    wasOffline: readonly(wasOffline),
    clearOfflineFlag,
    setup,
    cleanup
  }
}

// Singleton for use outside components
const globalOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

if (typeof globalThis.window !== 'undefined') {
  globalThis.addEventListener('online', () => {
    globalOnline.value = true
  })
  globalThis.addEventListener('offline', () => {
    globalOnline.value = false
  })
}

export const networkStatus = {
  isOnline: readonly(globalOnline)
}

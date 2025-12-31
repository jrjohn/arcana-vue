import { ref, readonly, onMounted, onUnmounted } from 'vue'

/**
 * Network status service - Monitor online/offline status
 */
export function useNetworkStatus() {
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const wasOffline = ref(false)

  function handleOnline() {
    isOnline.value = true
  }

  function handleOffline() {
    isOnline.value = false
    wasOffline.value = true
  }

  function setup() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
  }

  function cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
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
const globalOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    globalOnline.value = true
  })
  window.addEventListener('offline', () => {
    globalOnline.value = false
  })
}

export const networkStatus = {
  isOnline: readonly(globalOnline)
}

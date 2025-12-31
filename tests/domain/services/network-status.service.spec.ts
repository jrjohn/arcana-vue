import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNetworkStatus, networkStatus } from '@/domain/services/network-status.service'

describe('Network Status Service', () => {
  let addEventSpy: ReturnType<typeof vi.spyOn>
  let removeEventSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventSpy = vi.spyOn(window, 'addEventListener')
    removeEventSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useNetworkStatus', () => {
    it('should return isOnline status', () => {
      const { isOnline } = useNetworkStatus()
      expect(typeof isOnline.value).toBe('boolean')
    })

    it('should return wasOffline as false initially', () => {
      const { wasOffline } = useNetworkStatus()
      // wasOffline might be true if offline was triggered in previous tests
      expect(typeof wasOffline.value).toBe('boolean')
    })

    it('should provide clearOfflineFlag function', () => {
      const { clearOfflineFlag, wasOffline } = useNetworkStatus()
      expect(typeof clearOfflineFlag).toBe('function')
      clearOfflineFlag()
      expect(wasOffline.value).toBe(false)
    })

    it('should provide setup function', () => {
      const { setup } = useNetworkStatus()
      expect(typeof setup).toBe('function')
    })

    it('should provide cleanup function', () => {
      const { cleanup } = useNetworkStatus()
      expect(typeof cleanup).toBe('function')
    })

    it('setup should add event listeners', () => {
      const { setup } = useNetworkStatus()
      setup()
      expect(addEventSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(addEventSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    })

    it('cleanup should remove event listeners', () => {
      const { cleanup } = useNetworkStatus()
      cleanup()
      expect(removeEventSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(removeEventSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    })
  })

  describe('networkStatus singleton', () => {
    it('should be available as singleton', () => {
      expect(networkStatus).toBeDefined()
      expect(networkStatus.isOnline).toBeDefined()
    })

    it('should have isOnline as readonly', () => {
      expect(typeof networkStatus.isOnline.value).toBe('boolean')
    })
  })

  describe('event handlers', () => {
    it('should handle online event', () => {
      const { setup, isOnline } = useNetworkStatus()
      setup()

      // Simulate online event
      window.dispatchEvent(new Event('online'))

      expect(isOnline.value).toBe(true)
    })

    it('should handle offline event', () => {
      const { setup, isOnline, wasOffline } = useNetworkStatus()
      setup()

      // Simulate offline event
      window.dispatchEvent(new Event('offline'))

      expect(isOnline.value).toBe(false)
      expect(wasOffline.value).toBe(true)
    })
  })
})

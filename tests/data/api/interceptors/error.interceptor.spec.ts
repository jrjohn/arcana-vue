import { describe, it, expect, beforeEach, vi } from 'vitest'
import { errorInterceptor } from '@/data/api/interceptors/error.interceptor'
import type { AxiosResponse, AxiosError } from 'axios'

describe('Error Interceptor', () => {
  let dispatchEventSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('arcana_auth_token', 'test-token')
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
    vi.clearAllMocks()
  })

  function createMockError(status?: number, message: string = 'Error'): AxiosError {
    const error = new Error(message) as AxiosError
    error.isAxiosError = true
    error.response = status
      ? ({ status, data: {} } as AxiosResponse)
      : undefined
    error.message = message
    return error
  }

  describe('onResponse', () => {
    it('should pass through successful responses', () => {
      const response = { data: { success: true } } as AxiosResponse
      const result = errorInterceptor.onResponse(response)
      expect(result).toBe(response)
    })
  })

  describe('onResponseError', () => {
    it('should handle 401 Unauthorized', async () => {
      const error = createMockError(401)

      await expect(errorInterceptor.onResponseError(error)).rejects.toBe(error)

      expect(localStorage.getItem('arcana_auth_token')).toBeNull()
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:unauthorized' })
      )
    })

    it('should handle 403 Forbidden', async () => {
      const error = createMockError(403)

      await expect(errorInterceptor.onResponseError(error)).rejects.toBe(error)

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:forbidden' })
      )
    })

    it('should handle 500 Server Error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = createMockError(500, 'Internal Server Error')

      await expect(errorInterceptor.onResponseError(error)).rejects.toBe(error)

      expect(consoleSpy).toHaveBeenCalledWith('Server error:', 'Internal Server Error')
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error:server' })
      )

      consoleSpy.mockRestore()
    })

    it('should handle 502 Server Error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = createMockError(502)

      await expect(errorInterceptor.onResponseError(error)).rejects.toBe(error)

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error:server' })
      )

      consoleSpy.mockRestore()
    })

    it('should handle network errors (no response)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = createMockError(undefined, 'Network Error')

      await expect(errorInterceptor.onResponseError(error)).rejects.toBe(error)

      expect(consoleSpy).toHaveBeenCalledWith('Network error:', 'Network Error')
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error:network' })
      )

      consoleSpy.mockRestore()
    })

    it('should pass through other errors', async () => {
      const error = createMockError(404)

      await expect(errorInterceptor.onResponseError(error)).rejects.toBe(error)

      // Should not dispatch server or network error events for 404
      expect(dispatchEventSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error:server' })
      )
      expect(dispatchEventSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error:network' })
      )
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authInterceptor, authTokenManager } from '@/data/api/interceptors/auth.interceptor'
import type { InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

describe('Auth Interceptor', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function createMockConfig(url?: string): InternalAxiosRequestConfig {
    const headers = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      delete: vi.fn()
    } as unknown as AxiosHeaders

    return {
      url,
      headers
    } as InternalAxiosRequestConfig
  }

  describe('authInterceptor.onRequest', () => {
    it('should skip auth for public endpoints', () => {
      const config = createMockConfig('/auth/login')
      const result = authInterceptor.onRequest(config)

      expect(config.headers.set).not.toHaveBeenCalled()
      expect(result).toBe(config)
    })

    it('should skip auth for register endpoint', () => {
      const config = createMockConfig('/auth/register')
      authInterceptor.onRequest(config)

      expect(config.headers.set).not.toHaveBeenCalled()
    })

    it('should skip auth for refresh endpoint', () => {
      const config = createMockConfig('/auth/refresh')
      authInterceptor.onRequest(config)

      expect(config.headers.set).not.toHaveBeenCalled()
    })

    it('should skip auth for forgot-password endpoint', () => {
      const config = createMockConfig('/auth/forgot-password')
      authInterceptor.onRequest(config)

      expect(config.headers.set).not.toHaveBeenCalled()
    })

    it('should add Bearer token for protected endpoints', () => {
      localStorage.setItem('arcana_auth_token', 'test-token')
      const config = createMockConfig('/api/users')
      authInterceptor.onRequest(config)

      expect(config.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer test-token')
    })

    it('should not add token if not available', () => {
      const config = createMockConfig('/api/users')
      authInterceptor.onRequest(config)

      expect(config.headers.set).not.toHaveBeenCalled()
    })

    it('should handle undefined URL', () => {
      const config = createMockConfig(undefined)
      const result = authInterceptor.onRequest(config)

      expect(result).toBe(config)
    })
  })

  describe('authInterceptor.onRequestError', () => {
    it('should reject with error', async () => {
      const error = new Error('Request failed')

      await expect(authInterceptor.onRequestError(error as never)).rejects.toThrow('Request failed')
    })
  })

  describe('authTokenManager', () => {
    describe('setToken', () => {
      it('should store token in localStorage', () => {
        authTokenManager.setToken('new-token')
        expect(localStorage.getItem('arcana_auth_token')).toBe('new-token')
      })
    })

    describe('getToken', () => {
      it('should retrieve token from localStorage', () => {
        localStorage.setItem('arcana_auth_token', 'stored-token')
        expect(authTokenManager.getToken()).toBe('stored-token')
      })

      it('should return null if no token', () => {
        expect(authTokenManager.getToken()).toBeNull()
      })
    })

    describe('removeToken', () => {
      it('should remove token from localStorage', () => {
        localStorage.setItem('arcana_auth_token', 'token-to-remove')
        authTokenManager.removeToken()
        expect(localStorage.getItem('arcana_auth_token')).toBeNull()
      })
    })

    describe('isAuthenticated', () => {
      it('should return true when token exists', () => {
        localStorage.setItem('arcana_auth_token', 'valid-token')
        expect(authTokenManager.isAuthenticated()).toBe(true)
      })

      it('should return false when no token', () => {
        expect(authTokenManager.isAuthenticated()).toBe(false)
      })
    })
  })
})

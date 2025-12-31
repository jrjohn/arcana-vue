import type { InternalAxiosRequestConfig, AxiosError } from 'axios'

/**
 * Public endpoints that don't require authentication
 */
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password'
]

/**
 * Storage key for auth token
 */
const TOKEN_KEY = 'arcana_auth_token'

/**
 * Check if endpoint is public
 */
function isPublicEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

/**
 * Get stored auth token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Auth interceptor - Adds Bearer token to requests
 */
export const authInterceptor = {
  /**
   * Request interceptor
   */
  onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Skip auth for public endpoints
    if (isPublicEndpoint(config.url)) {
      return config
    }

    // Add auth token if available
    const token = getAuthToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    return config
  },

  /**
   * Request error handler
   */
  onRequestError(error: AxiosError): Promise<never> {
    return Promise.reject(error)
  }
}

/**
 * Auth token management
 */
export const authTokenManager = {
  /**
   * Set auth token
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    return getAuthToken()
  },

  /**
   * Remove auth token
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!getAuthToken()
  }
}

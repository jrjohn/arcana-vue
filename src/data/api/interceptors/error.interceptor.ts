import type { AxiosResponse, AxiosError } from 'axios'
import { authTokenManager } from './auth.interceptor'

/**
 * Error interceptor - Centralized HTTP error handling
 */
export const errorInterceptor = {
  /**
   * Response success handler
   */
  onResponse(response: AxiosResponse): AxiosResponse {
    return response
  },

  /**
   * Response error handler
   */
  onResponseError(error: AxiosError): Promise<never> {
    const status = error.response?.status

    // Handle 401 Unauthorized - auto logout
    if (status === 401) {
      authTokenManager.removeToken()
      // Could dispatch event or redirect to login
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:forbidden'))
      }
    }

    // Handle 500+ Server errors
    if (status && status >= 500) {
      console.error('Server error:', error.message)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('error:server', {
          detail: { status, message: error.message }
        }))
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('error:network', {
          detail: { message: error.message }
        }))
      }
    }

    return Promise.reject(error)
  }
}

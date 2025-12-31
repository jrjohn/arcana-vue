import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { authInterceptor } from './interceptors/auth.interceptor'
import { errorInterceptor } from './interceptors/error.interceptor'

/**
 * API configuration
 */
const API_CONFIG = {
  baseURL: 'https://reqres.in/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY || ''
  }
}

/**
 * Create axios instance with interceptors
 */
function createApiClient(): AxiosInstance {
  const client = axios.create(API_CONFIG)

  // Add request interceptor for auth
  client.interceptors.request.use(
    authInterceptor.onRequest,
    authInterceptor.onRequestError
  )

  // Add response interceptor for error handling
  client.interceptors.response.use(
    errorInterceptor.onResponse,
    errorInterceptor.onResponseError
  )

  return client
}

const apiClient = createApiClient()

/**
 * API service - Centralized HTTP client
 */
export const apiService = {
  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(url, config)
    return response.data
  },

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config)
    return response.data
  },

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config)
    return response.data
  },

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.patch(url, data, config)
    return response.data
  },

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(url, config)
    return response.data
  },

  /**
   * Get the underlying axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return apiClient
  }
}

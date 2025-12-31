/**
 * Error Boundary Plugin
 * Global error handler for Vue application
 */

import type { App, ComponentPublicInstance } from 'vue'

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  error: Error
  info: string
  component: string | null
  timestamp: Date
  url: string
}

/**
 * Error log store (in-memory for now, can be extended to send to backend)
 */
const errorLog: ErrorLogEntry[] = []
const MAX_ERROR_LOG_SIZE = 100

/**
 * Add error to log
 */
function logError(entry: ErrorLogEntry): void {
  errorLog.unshift(entry)

  // Trim log if too large
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.pop()
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.group('🚨 Vue Error Captured')
    console.error('Error:', entry.error)
    console.log('Info:', entry.info)
    console.log('Component:', entry.component)
    console.log('URL:', entry.url)
    console.log('Timestamp:', entry.timestamp)
    console.groupEnd()
  }
}

/**
 * Get component name from instance
 */
function getComponentName(instance: ComponentPublicInstance | null): string | null {
  if (!instance) return null

  const name = instance.$options?.name
  if (name) return name

  // Try to get from __name (script setup components)
  const internalInstance = instance.$ as { type?: { __name?: string } }
  return internalInstance?.type?.__name ?? null
}

/**
 * Error boundary plugin
 * Installs global error handling for the Vue application
 */
export const errorBoundaryPlugin = {
  install(app: App): void {
    /**
     * Global error handler for Vue component errors
     */
    app.config.errorHandler = (
      error: unknown,
      instance: ComponentPublicInstance | null,
      info: string
    ) => {
      const err = error instanceof Error ? error : new Error(String(error))

      logError({
        error: err,
        info,
        component: getComponentName(instance),
        timestamp: new Date(),
        url: window.location.href
      })

      // Dispatch custom event for error tracking integrations
      window.dispatchEvent(
        new CustomEvent('vue:error', {
          detail: { error: err, info, component: instance }
        })
      )
    }

    /**
     * Global warning handler (development only)
     */
    if (import.meta.env.DEV) {
      app.config.warnHandler = (msg: string, instance: ComponentPublicInstance | null, trace: string) => {
        console.warn('⚠️ Vue Warning:', msg)
        if (instance) {
          console.log('Component:', getComponentName(instance))
        }
        if (trace) {
          console.log('Trace:', trace)
        }
      }
    }

    /**
     * Provide error log access to components
     */
    app.provide('errorLog', {
      getErrors: () => [...errorLog],
      clearErrors: () => {
        errorLog.length = 0
      },
      getLastError: () => errorLog[0] ?? null
    })
  }
}

/**
 * Composable to access error log from components
 */
export interface ErrorLogAccessor {
  getErrors: () => ErrorLogEntry[]
  clearErrors: () => void
  getLastError: () => ErrorLogEntry | null
}

export function useErrorLog(): ErrorLogAccessor {
  return {
    getErrors: () => [...errorLog],
    clearErrors: () => {
      errorLog.length = 0
    },
    getLastError: () => errorLog[0] ?? null
  }
}

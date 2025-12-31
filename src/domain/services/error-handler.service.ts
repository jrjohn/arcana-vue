import { ref } from 'vue'
import { AppError, ErrorCategory, ErrorCodes, createAppError } from '@/domain/entities/app-error.entity'
import type { AxiosError } from 'axios'

/**
 * Error handler service - Centralized error handling
 */
export function useErrorHandler() {
  const lastError = ref<AppError | null>(null)

  /**
   * Handle HTTP/Axios errors
   */
  function handleHttpError(error: AxiosError): AppError {
    const status = error.response?.status
    let appError: AppError

    switch (status) {
      case 400:
        appError = createAppError(
          ErrorCodes.VALIDATION_ERROR,
          'Bad request',
          ErrorCategory.VALIDATION,
          'error.validation',
          { status }
        )
        break
      case 401:
        appError = createAppError(
          ErrorCodes.UNAUTHORIZED,
          'Unauthorized',
          ErrorCategory.AUTHENTICATION,
          'error.unauthorized',
          { status }
        )
        break
      case 403:
        appError = createAppError(
          ErrorCodes.FORBIDDEN,
          'Forbidden',
          ErrorCategory.AUTHORIZATION,
          'error.forbidden',
          { status }
        )
        break
      case 404:
        appError = createAppError(
          ErrorCodes.NOT_FOUND,
          'Not found',
          ErrorCategory.NOT_FOUND,
          'error.notFound',
          { status }
        )
        break
      case 408:
      case 504:
        appError = createAppError(
          ErrorCodes.TIMEOUT_ERROR,
          'Request timeout',
          ErrorCategory.NETWORK,
          'error.timeout',
          { status }
        )
        break
      default:
        if (!error.response) {
          // Network error (no response)
          appError = createAppError(
            ErrorCodes.NETWORK_ERROR,
            'Network error',
            ErrorCategory.NETWORK,
            'error.network',
            { originalMessage: error.message }
          )
        } else {
          appError = createAppError(
            ErrorCodes.UNKNOWN_ERROR,
            error.message || 'Unknown error',
            ErrorCategory.UNKNOWN,
            'error.unknown',
            { status }
          )
        }
    }

    lastError.value = appError
    return appError
  }

  /**
   * Handle storage errors
   */
  function handleStorageError(error: Error): AppError {
    const appError = createAppError(
      ErrorCodes.STORAGE_ERROR,
      error.message,
      ErrorCategory.STORAGE,
      'error.storage',
      { originalMessage: error.message },
      error
    )

    lastError.value = appError
    return appError
  }

  /**
   * Handle validation errors
   */
  function handleValidationError(message: string, context?: Record<string, unknown>): AppError {
    const appError = createAppError(
      ErrorCodes.VALIDATION_ERROR,
      message,
      ErrorCategory.VALIDATION,
      'error.validation',
      context
    )

    lastError.value = appError
    return appError
  }

  /**
   * Handle generic errors
   */
  function handleError(error: unknown): AppError {
    if (error instanceof Error && 'isAxiosError' in error) {
      return handleHttpError(error as AxiosError)
    }

    if (error instanceof Error) {
      const appError = createAppError(
        ErrorCodes.UNKNOWN_ERROR,
        error.message,
        ErrorCategory.UNKNOWN,
        'error.unknown',
        { originalMessage: error.message },
        error
      )

      lastError.value = appError
      return appError
    }

    const appError = createAppError(
      ErrorCodes.UNKNOWN_ERROR,
      String(error),
      ErrorCategory.UNKNOWN,
      'error.unknown'
    )

    lastError.value = appError
    return appError
  }

  /**
   * Clear the last error
   */
  function clearError() {
    lastError.value = null
  }

  return {
    lastError,
    handleHttpError,
    handleStorageError,
    handleValidationError,
    handleError,
    clearError
  }
}

// Export singleton instance
export const errorHandler = useErrorHandler()

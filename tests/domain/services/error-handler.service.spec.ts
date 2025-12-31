import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useErrorHandler, errorHandler } from '@/domain/services/error-handler.service'
import { ErrorCategory, ErrorCodes } from '@/domain/entities/app-error.entity'
import type { AxiosError } from 'axios'

describe('Error Handler Service', () => {
  beforeEach(() => {
    errorHandler.clearError()
  })

  function createAxiosError(status?: number, message: string = 'Error'): AxiosError {
    const error = new Error(message) as AxiosError
    error.isAxiosError = true
    error.response = status ? { status } as never : undefined
    error.message = message
    return error
  }

  describe('handleHttpError', () => {
    it('should handle 400 Bad Request', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(400)
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR)
      expect(result.category).toBe(ErrorCategory.VALIDATION)
      expect(result.userMessage).toBe('error.validation')
    })

    it('should handle 401 Unauthorized', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(401)
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.UNAUTHORIZED)
      expect(result.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(result.userMessage).toBe('error.unauthorized')
    })

    it('should handle 403 Forbidden', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(403)
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.FORBIDDEN)
      expect(result.category).toBe(ErrorCategory.AUTHORIZATION)
      expect(result.userMessage).toBe('error.forbidden')
    })

    it('should handle 404 Not Found', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(404)
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.NOT_FOUND)
      expect(result.category).toBe(ErrorCategory.NOT_FOUND)
      expect(result.userMessage).toBe('error.notFound')
    })

    it('should handle 408 Request Timeout', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(408)
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.TIMEOUT_ERROR)
      expect(result.category).toBe(ErrorCategory.NETWORK)
      expect(result.userMessage).toBe('error.timeout')
    })

    it('should handle 504 Gateway Timeout', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(504)
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.TIMEOUT_ERROR)
      expect(result.category).toBe(ErrorCategory.NETWORK)
    })

    it('should handle network error (no response)', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(undefined, 'Network Error')
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR)
      expect(result.category).toBe(ErrorCategory.NETWORK)
      expect(result.userMessage).toBe('error.network')
    })

    it('should handle unknown status codes', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(500, 'Server Error')
      const result = handler.handleHttpError(error)

      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR)
      expect(result.category).toBe(ErrorCategory.UNKNOWN)
      expect(result.userMessage).toBe('error.unknown')
    })

    it('should set lastError', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(404)
      handler.handleHttpError(error)

      expect(handler.lastError.value).not.toBeNull()
      expect(handler.lastError.value?.code).toBe(ErrorCodes.NOT_FOUND)
    })
  })

  describe('handleStorageError', () => {
    it('should create storage error', () => {
      const handler = useErrorHandler()
      const error = new Error('Storage quota exceeded')
      const result = handler.handleStorageError(error)

      expect(result.code).toBe(ErrorCodes.STORAGE_ERROR)
      expect(result.category).toBe(ErrorCategory.STORAGE)
      expect(result.userMessage).toBe('error.storage')
      expect(result.underlyingError).toBe(error)
    })

    it('should set lastError', () => {
      const handler = useErrorHandler()
      handler.handleStorageError(new Error('Test'))

      expect(handler.lastError.value?.category).toBe(ErrorCategory.STORAGE)
    })
  })

  describe('handleValidationError', () => {
    it('should create validation error', () => {
      const handler = useErrorHandler()
      const result = handler.handleValidationError('Invalid input')

      expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR)
      expect(result.category).toBe(ErrorCategory.VALIDATION)
      expect(result.message).toBe('Invalid input')
    })

    it('should include context', () => {
      const handler = useErrorHandler()
      const context = { field: 'email' }
      const result = handler.handleValidationError('Invalid email', context)

      expect(result.context).toEqual(context)
    })
  })

  describe('handleError', () => {
    it('should handle Axios errors', () => {
      const handler = useErrorHandler()
      const error = createAxiosError(401)
      const result = handler.handleError(error)

      expect(result.code).toBe(ErrorCodes.UNAUTHORIZED)
    })

    it('should handle regular Error objects', () => {
      const handler = useErrorHandler()
      const error = new Error('Something went wrong')
      const result = handler.handleError(error)

      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR)
      expect(result.category).toBe(ErrorCategory.UNKNOWN)
      expect(result.message).toBe('Something went wrong')
    })

    it('should handle string errors', () => {
      const handler = useErrorHandler()
      const result = handler.handleError('String error')

      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR)
      expect(result.message).toBe('String error')
    })

    it('should handle unknown error types', () => {
      const handler = useErrorHandler()
      const result = handler.handleError(123)

      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR)
      expect(result.message).toBe('123')
    })
  })

  describe('clearError', () => {
    it('should clear lastError', () => {
      const handler = useErrorHandler()
      handler.handleError(new Error('Test'))
      expect(handler.lastError.value).not.toBeNull()

      handler.clearError()
      expect(handler.lastError.value).toBeNull()
    })
  })

  describe('singleton errorHandler', () => {
    it('should be available as singleton', () => {
      expect(errorHandler).toBeDefined()
      expect(errorHandler.handleError).toBeDefined()
      expect(errorHandler.handleHttpError).toBeDefined()
      expect(errorHandler.handleStorageError).toBeDefined()
      expect(errorHandler.handleValidationError).toBeDefined()
      expect(errorHandler.clearError).toBeDefined()
    })

    it('should handle errors', () => {
      const result = errorHandler.handleError(new Error('Test'))
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR)
    })
  })
})

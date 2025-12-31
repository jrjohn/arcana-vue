import { describe, it, expect } from 'vitest'
import {
  ErrorCategory,
  ErrorCodes,
  createAppError,
  type AppError
} from '@/domain/entities/app-error.entity'

describe('AppError Entity', () => {
  describe('ErrorCategory', () => {
    it('should have all expected error categories', () => {
      expect(ErrorCategory.NETWORK).toBe('NETWORK')
      expect(ErrorCategory.VALIDATION).toBe('VALIDATION')
      expect(ErrorCategory.STORAGE).toBe('STORAGE')
      expect(ErrorCategory.AUTHENTICATION).toBe('AUTHENTICATION')
      expect(ErrorCategory.AUTHORIZATION).toBe('AUTHORIZATION')
      expect(ErrorCategory.NOT_FOUND).toBe('NOT_FOUND')
      expect(ErrorCategory.UNKNOWN).toBe('UNKNOWN')
    })
  })

  describe('ErrorCodes', () => {
    it('should have network error codes', () => {
      expect(ErrorCodes.NETWORK_ERROR).toBe('E10001')
      expect(ErrorCodes.TIMEOUT_ERROR).toBe('E10002')
      expect(ErrorCodes.CONNECTION_REFUSED).toBe('E10003')
    })

    it('should have validation error codes', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe('E20001')
      expect(ErrorCodes.REQUIRED_FIELD).toBe('E20002')
      expect(ErrorCodes.INVALID_FORMAT).toBe('E20003')
    })

    it('should have storage error codes', () => {
      expect(ErrorCodes.STORAGE_ERROR).toBe('E30001')
      expect(ErrorCodes.QUOTA_EXCEEDED).toBe('E30002')
    })

    it('should have auth error codes', () => {
      expect(ErrorCodes.UNAUTHORIZED).toBe('E40001')
      expect(ErrorCodes.FORBIDDEN).toBe('E40002')
      expect(ErrorCodes.TOKEN_EXPIRED).toBe('E40003')
    })

    it('should have not found error codes', () => {
      expect(ErrorCodes.NOT_FOUND).toBe('E50001')
      expect(ErrorCodes.USER_NOT_FOUND).toBe('E50002')
    })

    it('should have unknown error codes', () => {
      expect(ErrorCodes.UNKNOWN_ERROR).toBe('E90001')
    })
  })

  describe('createAppError', () => {
    it('should create an AppError with all required fields', () => {
      const error = createAppError(
        ErrorCodes.NETWORK_ERROR,
        'Network connection failed',
        ErrorCategory.NETWORK,
        'error.network'
      )

      expect(error.code).toBe(ErrorCodes.NETWORK_ERROR)
      expect(error.message).toBe('Network connection failed')
      expect(error.category).toBe(ErrorCategory.NETWORK)
      expect(error.userMessage).toBe('error.network')
      expect(error.timestamp).toBeInstanceOf(Date)
      expect(error.context).toBeUndefined()
      expect(error.underlyingError).toBeUndefined()
    })

    it('should create an AppError with context', () => {
      const context = { userId: 123, endpoint: '/api/users' }
      const error = createAppError(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        ErrorCategory.VALIDATION,
        'error.validation',
        context
      )

      expect(error.context).toEqual(context)
    })

    it('should create an AppError with underlying error', () => {
      const underlyingError = new Error('Original error')
      const error = createAppError(
        ErrorCodes.UNKNOWN_ERROR,
        'Something went wrong',
        ErrorCategory.UNKNOWN,
        'error.unknown',
        undefined,
        underlyingError
      )

      expect(error.underlyingError).toBe(underlyingError)
    })

    it('should create an AppError with all optional fields', () => {
      const context = { field: 'email' }
      const underlyingError = new Error('Validation failed')

      const error = createAppError(
        ErrorCodes.REQUIRED_FIELD,
        'Email is required',
        ErrorCategory.VALIDATION,
        'user.form.emailRequired',
        context,
        underlyingError
      )

      expect(error.code).toBe(ErrorCodes.REQUIRED_FIELD)
      expect(error.message).toBe('Email is required')
      expect(error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.userMessage).toBe('user.form.emailRequired')
      expect(error.context).toEqual(context)
      expect(error.underlyingError).toBe(underlyingError)
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('should set timestamp to current time', () => {
      const before = new Date()
      const error = createAppError(
        ErrorCodes.NETWORK_ERROR,
        'Test',
        ErrorCategory.NETWORK,
        'error.network'
      )
      const after = new Date()

      expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })
})

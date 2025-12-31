/**
 * Error categories for structured error handling
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured application error
 */
export interface AppError {
  code: string
  message: string
  category: ErrorCategory
  userMessage: string
  context?: Record<string, unknown>
  timestamp: Date
  underlyingError?: Error
}

/**
 * Create an AppError from various error types
 */
export function createAppError(
  code: string,
  message: string,
  category: ErrorCategory,
  userMessageKey: string,
  context?: Record<string, unknown>,
  underlyingError?: Error
): AppError {
  return {
    code,
    message,
    category,
    userMessage: userMessageKey,
    context,
    timestamp: new Date(),
    underlyingError
  }
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Network errors (E1xxxx)
  NETWORK_ERROR: 'E10001',
  TIMEOUT_ERROR: 'E10002',
  CONNECTION_REFUSED: 'E10003',

  // Validation errors (E2xxxx)
  VALIDATION_ERROR: 'E20001',
  REQUIRED_FIELD: 'E20002',
  INVALID_FORMAT: 'E20003',

  // Storage errors (E3xxxx)
  STORAGE_ERROR: 'E30001',
  QUOTA_EXCEEDED: 'E30002',

  // Auth errors (E4xxxx)
  UNAUTHORIZED: 'E40001',
  FORBIDDEN: 'E40002',
  TOKEN_EXPIRED: 'E40003',

  // Not found errors (E5xxxx)
  NOT_FOUND: 'E50001',
  USER_NOT_FOUND: 'E50002',

  // Unknown errors (E9xxxx)
  UNKNOWN_ERROR: 'E90001'
} as const

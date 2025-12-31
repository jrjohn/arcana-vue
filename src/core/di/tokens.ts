/**
 * Dependency Injection Tokens
 * Symbols used as identifiers for service registration and resolution
 */

export const TOKENS = {
  // Data Layer - API & Cache
  ApiService: Symbol.for('ApiService'),
  MemoryCache: Symbol.for('MemoryCache'),
  LruCache: Symbol.for('LruCache'),
  IndexedDbService: Symbol.for('IndexedDbService'),

  // Data Layer - Repositories
  UserRepository: Symbol.for('UserRepository'),

  // Data Layer - Mappers
  UserMapper: Symbol.for('UserMapper'),

  // Domain Layer - Services
  UserService: Symbol.for('UserService'),
  ErrorHandler: Symbol.for('ErrorHandler'),
  SanitizationService: Symbol.for('SanitizationService'),
  NetworkStatus: Symbol.for('NetworkStatus'),
  I18nService: Symbol.for('I18nService'),

  // Domain Layer - Validators
  UserValidator: Symbol.for('UserValidator')
} as const

export type TokenKeys = keyof typeof TOKENS

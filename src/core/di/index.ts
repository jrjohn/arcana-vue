/**
 * Dependency Injection Module
 * Public exports for DI container, tokens, types, and decorators
 */

// Container
export { container, resolve, isBound, rebind, resetContainer } from './container'

// Tokens
export { TOKENS } from './tokens'
export type { TokenKeys } from './tokens'

// Types (interfaces)
export type {
  IApiService,
  IMemoryCache,
  ILruCache,
  ICacheManager,
  ILruCacheManager,
  IIndexedDbService,
  IUserService,
  IErrorHandler,
  ISanitizationService,
  INetworkStatus,
  IUserValidator,
  IUserMapper,
  IUserDao,
  IUserRepository,
  II18nService,
  CachedUser,
  SyncQueueItem,
  ValidationResult,
  FieldValidation
} from './types'

// Composables and helpers
export {
  useInject,
  useApiService,
  useMemoryCache,
  useLruCache,
  useIndexedDb,
  useUserDao,
  useUserRepository,
  useUserMapper,
  useUserService,
  useErrorHandler,
  useSanitizationService,
  useNetworkStatus,
  useUserValidator,
  createMockInjector,
  removeMockInjector
} from './decorators'

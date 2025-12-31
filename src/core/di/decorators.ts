/**
 * Vue Integration Decorators and Composables
 * Helpers for using DI container with Vue components and composables
 */

import { container } from './container'
import { TOKENS } from './tokens'
import type {
  IApiService,
  ICacheManager,
  ILruCacheManager,
  IIndexedDbService,
  IUserService,
  IErrorHandler,
  ISanitizationService,
  INetworkStatus,
  IUserValidator,
  IUserMapper,
  IUserRepository
} from './types'

/**
 * Inject a service from the DI container
 * Use this in Vue composables and setup functions
 *
 * @param token - The service identifier symbol
 * @returns The resolved service instance
 *
 * @example
 * ```typescript
 * // In a composable or component setup
 * const userService = useInject<IUserService>(TOKENS.UserService)
 * ```
 */
export function useInject<T>(token: symbol): T {
  return container.get<T>(token)
}

/**
 * Type-safe service injection composables
 * These provide better developer experience with auto-complete
 */

export function useApiService(): IApiService {
  return container.get<IApiService>(TOKENS.ApiService)
}

export function useMemoryCache(): ICacheManager {
  return container.get<ICacheManager>(TOKENS.MemoryCache)
}

export function useLruCache(): ILruCacheManager {
  return container.get<ILruCacheManager>(TOKENS.LruCache)
}

export function useIndexedDb(): IIndexedDbService {
  return container.get<IIndexedDbService>(TOKENS.IndexedDbService)
}

export function useUserRepository(): IUserRepository {
  return container.get<IUserRepository>(TOKENS.UserRepository)
}

export function useUserMapper(): IUserMapper {
  return container.get<IUserMapper>(TOKENS.UserMapper)
}

export function useUserService(): IUserService {
  return container.get<IUserService>(TOKENS.UserService)
}

export function useErrorHandler(): IErrorHandler {
  return container.get<IErrorHandler>(TOKENS.ErrorHandler)
}

export function useSanitizationService(): ISanitizationService {
  return container.get<ISanitizationService>(TOKENS.SanitizationService)
}

export function useNetworkStatus(): INetworkStatus {
  return container.get<INetworkStatus>(TOKENS.NetworkStatus)
}

export function useUserValidator(): IUserValidator {
  return container.get<IUserValidator>(TOKENS.UserValidator)
}

/**
 * Create a mock injector for testing
 * Allows replacing services with mocks in tests
 *
 * @example
 * ```typescript
 * const mockUserService = { getUsers: vi.fn() }
 * createMockInjector(TOKENS.UserService, mockUserService)
 * ```
 */
export function createMockInjector<T>(token: symbol, mock: T): void {
  if (container.isBound(token)) {
    container.rebindSync<T>(token).toConstantValue(mock)
  } else {
    container.bind<T>(token).toConstantValue(mock)
  }
}

/**
 * Remove a mock and restore the original binding
 * Call this in test cleanup
 */
export function removeMockInjector(token: symbol): void {
  if (container.isBound(token)) {
    container.unbind(token)
  }
}

/**
 * InversifyJS Container
 * Central dependency injection container for the application
 */

import 'reflect-metadata'
import { Container } from 'inversify'
import { TOKENS } from './tokens'

// Import existing services (these will be refactored to injectable classes)
import { apiService } from '@/data/api/api.service'
import { memoryCache } from '@/data/cache/memory-cache.service'
import { lruCache } from '@/data/cache/lru-cache.service'
import { indexedDbService } from '@/data/cache/indexed-db.service'
import { userRepository } from '@/data/repositories/user.repository'
import { userMapper } from '@/data/mappers/user.mapper'
import { userService } from '@/domain/services/user.service'
import { errorHandler } from '@/domain/services/error-handler.service'
import { sanitizationService } from '@/domain/services/sanitization.service'
import { networkStatus } from '@/domain/services/network-status.service'
import { userValidator } from '@/domain/validators/user.validator'

// Import interfaces
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
 * Create and configure the DI container
 */
function createContainer(): Container {
  const container = new Container({
    defaultScope: 'Singleton'
  })

  // Bind Data Layer - API & Cache
  container.bind<IApiService>(TOKENS.ApiService).toConstantValue(apiService)
  container.bind<ICacheManager>(TOKENS.MemoryCache).toConstantValue(memoryCache)
  container.bind<ILruCacheManager>(TOKENS.LruCache).toConstantValue(lruCache)
  container.bind<IIndexedDbService>(TOKENS.IndexedDbService).toConstantValue(indexedDbService)

  // Bind Data Layer - Repositories & Mappers
  container.bind<IUserRepository>(TOKENS.UserRepository).toConstantValue(userRepository)
  container.bind<IUserMapper>(TOKENS.UserMapper).toConstantValue(userMapper)

  // Bind Domain Layer - Services
  container.bind<IUserService>(TOKENS.UserService).toConstantValue(userService)
  container.bind<IErrorHandler>(TOKENS.ErrorHandler).toConstantValue(errorHandler)
  container.bind<ISanitizationService>(TOKENS.SanitizationService).toConstantValue(sanitizationService)
  container.bind<INetworkStatus>(TOKENS.NetworkStatus).toConstantValue(networkStatus)

  // Bind Domain Layer - Validators
  container.bind<IUserValidator>(TOKENS.UserValidator).toConstantValue(userValidator)

  return container
}

/**
 * Application DI container instance
 */
export const container = createContainer()

/**
 * Resolve a service from the container
 * @param token - The service identifier symbol
 * @returns The resolved service instance
 */
export function resolve<T>(token: symbol): T {
  return container.get<T>(token)
}

/**
 * Check if a service is registered
 * @param token - The service identifier symbol
 */
export function isBound(token: symbol): boolean {
  return container.isBound(token)
}

/**
 * Rebind a service (useful for testing)
 * @param token - The service identifier symbol
 */
export function rebind<T>(token: symbol) {
  return container.rebind<T>(token)
}

/**
 * Reset the container to initial state
 * Useful for testing cleanup
 */
export function resetContainer(): void {
  container.unbindAll()
  // Re-bind all services
  container.bind<IApiService>(TOKENS.ApiService).toConstantValue(apiService)
  container.bind<ICacheManager>(TOKENS.MemoryCache).toConstantValue(memoryCache)
  container.bind<ILruCacheManager>(TOKENS.LruCache).toConstantValue(lruCache)
  container.bind<IIndexedDbService>(TOKENS.IndexedDbService).toConstantValue(indexedDbService)
  container.bind<IUserRepository>(TOKENS.UserRepository).toConstantValue(userRepository)
  container.bind<IUserMapper>(TOKENS.UserMapper).toConstantValue(userMapper)
  container.bind<IUserService>(TOKENS.UserService).toConstantValue(userService)
  container.bind<IErrorHandler>(TOKENS.ErrorHandler).toConstantValue(errorHandler)
  container.bind<ISanitizationService>(TOKENS.SanitizationService).toConstantValue(sanitizationService)
  container.bind<INetworkStatus>(TOKENS.NetworkStatus).toConstantValue(networkStatus)
  container.bind<IUserValidator>(TOKENS.UserValidator).toConstantValue(userValidator)
}

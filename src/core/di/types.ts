/**
 * Service Interface Definitions
 * Contracts for all injectable services
 */

import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ComputedRef, Ref } from 'vue'
import type {
  User,
  UserListResult,
  CreateUserInput,
  UpdateUserInput,
  CreatedUser,
  UpdatedUser
} from '@/domain/entities/user.entity'
import type { IUserRepository } from '@/data/repositories/interfaces'

/**
 * API Service Interface
 */
export interface IApiService {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  getClient(): AxiosInstance
}

/**
 * Memory Cache Interface
 */
export interface IMemoryCache<T> {
  get(key: string): T | undefined
  set(key: string, value: T): void
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  size(): number
  keys(): string[]
  values(): T[]
}

/**
 * LRU Cache Interface
 */
export interface ILruCache<T> {
  get(key: string): T | undefined
  set(key: string, value: T, ttl?: number): void
  has(key: string): boolean
  delete(key: string): boolean
  deletePattern(pattern: RegExp): number
  clear(): void
  clearExpired(): number
  size(): number
  stats(): { size: number; maxSize: number; defaultTtl: number }
}

/**
 * Cache Manager Interface (combines memory and LRU caches)
 */
export interface ICacheManager {
  users: IMemoryCache<unknown>
  general: IMemoryCache<unknown>
}

export interface ILruCacheManager {
  users: ILruCache<unknown>
  general: ILruCache<unknown>
}

/**
 * Cached User Interface
 */
export interface CachedUser extends User {
  cachedAt?: number
  syncStatus?: 'synced' | 'pending' | 'error'
}

/**
 * Sync Queue Item Interface
 */
export interface SyncQueueItem {
  id?: number
  type: 'create' | 'update' | 'delete'
  entityType: 'user'
  entityId: number | string
  payload: unknown
  createdAt: number
  retryCount: number
  lastError?: string
}

/**
 * IndexedDB Service Interface
 */
export interface IIndexedDbService {
  // User Operations
  getUsers(): Promise<CachedUser[]>
  getUserById(id: number): Promise<CachedUser | undefined>
  saveUser(user: User, syncStatus?: 'synced' | 'pending' | 'error'): Promise<void>
  saveUsers(users: User[]): Promise<void>
  deleteUser(id: number): Promise<void>
  clearUsers(): Promise<void>

  // Sync Queue
  addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void>
  getPendingSyncItems(): Promise<SyncQueueItem[]>
  removeSyncQueueItem(id: number): Promise<void>
  updateSyncQueueRetry(id: number, error: string): Promise<void>
  clearSyncQueue(): Promise<void>

  // Metadata
  getMetadata(key: string): Promise<string | undefined>
  setMetadata(key: string, value: string): Promise<void>

  // Cleanup
  clearAll(): Promise<void>
}

/**
 * Network Status Interface
 */
export interface INetworkStatus {
  isOnline: Ref<boolean>
}

/**
 * Validation Result Interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  errorKeys: string[]
}

/**
 * Field Validation Result
 */
export interface FieldValidation {
  isValid: boolean
  error?: string
  errorKey?: string
}

/**
 * User Validator Interface
 */
export interface IUserValidator {
  validateName(name: string): FieldValidation
  validateJob(job: string): FieldValidation
  validateEmail(email: string): FieldValidation
  validateCreateInput(input: CreateUserInput): ValidationResult
  validateUpdateInput(input: UpdateUserInput): ValidationResult
}

/**
 * User Service Interface
 */
export interface IUserService {
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  getUsers(page?: number): Promise<UserListResult>
  getUserById(id: number): Promise<User>
  createUser(input: CreateUserInput): Promise<CreatedUser>
  updateUser(id: number, input: UpdateUserInput): Promise<UpdatedUser>
  deleteUser(id: number): Promise<void>
  searchUsers(query: string, page?: number): Promise<UserListResult>
  validateCreateInput(input: CreateUserInput): ValidationResult
  validateUpdateInput(input: UpdateUserInput): ValidationResult
}

/**
 * Sanitization Service Interface
 */
export interface ISanitizationService {
  sanitizeHtml(input: string): string
  sanitizeText(input: string): string
  sanitizeUrl(input: string): string
  sanitizeEmail(input: string): string
  sanitizeFilename(input: string): string
  containsSqlInjection(input: string): boolean
  containsXss(input: string): boolean
  sanitizeObject<T extends Record<string, unknown>>(obj: T): T
  escapeRegex(input: string): string
  sanitizeInteger(input: string | number, min?: number, max?: number): number | null
}

/**
 * Error Handler Interface
 */
export interface IErrorHandler {
  lastError: Ref<import('@/domain/entities/app-error.entity').AppError | null>
  handleHttpError(error: unknown): import('@/domain/entities/app-error.entity').AppError
  handleStorageError(error: Error): import('@/domain/entities/app-error.entity').AppError
  handleValidationError(
    message: string,
    context?: Record<string, unknown>
  ): import('@/domain/entities/app-error.entity').AppError
  handleError(error: unknown): import('@/domain/entities/app-error.entity').AppError
  clearError(): void
}

/**
 * User Mapper Interface
 */
export interface IUserMapper {
  toEntity(dto: import('@/data/dtos/user.dto').UserDto): User
  toDto(entity: User): import('@/data/dtos/user.dto').UserDto
  toListResult(dto: import('@/data/dtos/user.dto').UsersListResponseDto): UserListResult
  toCreateRequest(input: CreateUserInput): import('@/data/dtos/user.dto').CreateUserRequestDto
  toUpdateRequest(input: UpdateUserInput): import('@/data/dtos/user.dto').UpdateUserRequestDto
  toCreatedUser(dto: import('@/data/dtos/user.dto').CreateUserResponseDto): CreatedUser
  toUpdatedUser(dto: import('@/data/dtos/user.dto').UpdateUserResponseDto): UpdatedUser
}

/**
 * I18n Service Interface
 */
export interface II18nService {
  currentLanguage: Ref<string>
  t(key: string, params?: Record<string, string | number>): string
  setLanguage(lang: string): void
  getAvailableLanguages(): string[]
}

// Re-export repository interface
export type { IUserRepository }

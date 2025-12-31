import { apiService } from '@/data/api/api.service'
import { userMapper } from '@/data/mappers/user.mapper'
import { memoryCache } from '@/data/cache/memory-cache.service'
import { lruCache } from '@/data/cache/lru-cache.service'
import { indexedDbService } from '@/data/cache/indexed-db.service'
import { networkStatus } from '@/domain/services/network-status.service'
import type {
  UsersListResponseDto,
  UserResponseDto,
  CreateUserResponseDto,
  UpdateUserResponseDto
} from '@/data/dtos/user.dto'
import type {
  User,
  UserListResult,
  CreateUserInput,
  UpdateUserInput,
  CreatedUser,
  UpdatedUser
} from '@/domain/entities/user.entity'

/**
 * Cache keys
 */
const CACHE_KEYS = {
  userList: (page: number) => `users:list:${page}`,
  user: (id: number) => `users:${id}`
}

/**
 * User Repository - 4-Layer Caching Architecture
 *
 * Layer 1: Memory Cache (<1ms) - Hot data, 50 items
 * Layer 2: LRU Cache (2-5ms) - Recent data, 100 items, 5min TTL
 * Layer 3: IndexedDB (10-50ms) - Offline persistence
 * Layer 4: API (100-500ms+) - Source of truth
 */
export const userRepository = {
  /**
   * Get paginated list of users with 4-layer caching
   */
  async getUsers(page: number = 1): Promise<UserListResult> {
    const cacheKey = CACHE_KEYS.userList(page)

    // Layer 1: Check memory cache
    const memoryResult = memoryCache.users.get(cacheKey) as UserListResult | undefined
    if (memoryResult) {
      return memoryResult
    }

    // Layer 2: Check LRU cache
    const lruResult = lruCache.users.get(cacheKey) as UserListResult | undefined
    if (lruResult) {
      // Promote to memory cache
      memoryCache.users.set(cacheKey, lruResult)
      return lruResult
    }

    // Layer 3: Check IndexedDB (only when offline)
    if (!networkStatus.isOnline.value) {
      const cachedUsers = await indexedDbService.getUsers()
      if (cachedUsers.length > 0) {
        const result: UserListResult = {
          users: cachedUsers,
          page: 1,
          perPage: cachedUsers.length,
          total: cachedUsers.length,
          totalPages: 1
        }
        return result
      }
    }

    // Layer 4: Fetch from API
    const response = await apiService.get<UsersListResponseDto>(`/users?page=${page}`)
    const result = userMapper.toListResult(response)

    // Cache in all layers
    memoryCache.users.set(cacheKey, result)
    lruCache.users.set(cacheKey, result)
    await indexedDbService.saveUsers(result.users)

    return result
  },

  /**
   * Get single user by ID with caching
   */
  async getUserById(id: number): Promise<User> {
    const cacheKey = CACHE_KEYS.user(id)

    // Layer 1: Check memory cache
    const memoryResult = memoryCache.users.get(cacheKey) as User | undefined
    if (memoryResult) {
      return memoryResult
    }

    // Layer 2: Check LRU cache
    const lruResult = lruCache.users.get(cacheKey) as User | undefined
    if (lruResult) {
      memoryCache.users.set(cacheKey, lruResult)
      return lruResult
    }

    // Layer 3: Check IndexedDB (only when offline)
    if (!networkStatus.isOnline.value) {
      const cachedUser = await indexedDbService.getUserById(id)
      if (cachedUser) {
        return cachedUser
      }
    }

    // Layer 4: Fetch from API
    const response = await apiService.get<UserResponseDto>(`/users/${id}`)
    const user = userMapper.toEntity(response.data)

    // Cache in all layers
    memoryCache.users.set(cacheKey, user)
    lruCache.users.set(cacheKey, user)
    await indexedDbService.saveUser(user)

    return user
  },

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<CreatedUser> {
    const requestDto = userMapper.toCreateRequest(input)

    if (!networkStatus.isOnline.value) {
      // Queue for offline sync
      await indexedDbService.addToSyncQueue({
        type: 'create',
        entityType: 'user',
        entityId: `temp_${Date.now()}`,
        payload: requestDto,
        createdAt: Date.now(),
        retryCount: 0
      })

      // Return optimistic response
      return {
        id: `temp_${Date.now()}`,
        name: input.name,
        job: input.job,
        createdAt: new Date().toISOString()
      }
    }

    const response = await apiService.post<CreateUserResponseDto>('/users', requestDto)
    const createdUser = userMapper.toCreatedUser(response)

    // Invalidate list cache
    this.invalidateListCache()

    return createdUser
  },

  /**
   * Update an existing user
   */
  async updateUser(id: number, input: UpdateUserInput): Promise<UpdatedUser> {
    const requestDto = userMapper.toUpdateRequest(input)

    if (!networkStatus.isOnline.value) {
      // Queue for offline sync
      await indexedDbService.addToSyncQueue({
        type: 'update',
        entityType: 'user',
        entityId: id,
        payload: requestDto,
        createdAt: Date.now(),
        retryCount: 0
      })

      // Return optimistic response
      return {
        name: input.name,
        job: input.job,
        updatedAt: new Date().toISOString()
      }
    }

    const response = await apiService.put<UpdateUserResponseDto>(`/users/${id}`, requestDto)
    const updatedUser = userMapper.toUpdatedUser(response)

    // Invalidate caches for this user
    const cacheKey = CACHE_KEYS.user(id)
    memoryCache.users.delete(cacheKey)
    lruCache.users.delete(cacheKey)
    this.invalidateListCache()

    return updatedUser
  },

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<void> {
    if (!networkStatus.isOnline.value) {
      // Queue for offline sync
      await indexedDbService.addToSyncQueue({
        type: 'delete',
        entityType: 'user',
        entityId: id,
        payload: null,
        createdAt: Date.now(),
        retryCount: 0
      })

      // Optimistically delete from local cache
      await indexedDbService.deleteUser(id)
      return
    }

    await apiService.delete(`/users/${id}`)

    // Invalidate caches
    const cacheKey = CACHE_KEYS.user(id)
    memoryCache.users.delete(cacheKey)
    lruCache.users.delete(cacheKey)
    await indexedDbService.deleteUser(id)
    this.invalidateListCache()
  },

  /**
   * Invalidate all list caches
   */
  invalidateListCache(): void {
    // Clear memory cache entries matching pattern
    for (const key of memoryCache.users.keys()) {
      if (key.startsWith('users:list:')) {
        memoryCache.users.delete(key)
      }
    }

    // Clear LRU cache entries matching pattern
    lruCache.users.deletePattern(/^users:list:/)
  },

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    memoryCache.users.clear()
    lruCache.users.clear()
    await indexedDbService.clearUsers()
  },

  /**
   * Prefetch users for better UX
   */
  async prefetchUsers(pages: number[]): Promise<void> {
    await Promise.all(pages.map(page => this.getUsers(page)))
  }
}

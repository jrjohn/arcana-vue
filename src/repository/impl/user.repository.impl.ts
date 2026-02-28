import { memoryCache } from '@/data/cache/memory-cache.service'
import { lruCache } from '@/data/cache/lru-cache.service'
import { indexedDbService } from '@/data/cache/indexed-db.service'
import { networkStatus } from '@/domain/services/network-status.service'
import { userMapper } from '@/data/mappers/user.mapper'
import type {
  User,
  UserListResult,
  CreateUserInput,
  UpdateUserInput,
  CreatedUser,
  UpdatedUser
} from '@/domain/entities/user.entity'
import type { IUserRepository } from '@/data/repositories/user.repository'
import type { IUserDao } from '@/dao/user.dao'

/**
 * Cache key helpers — kept identical to the legacy repository so that the
 * same in-memory entries can be shared if both implementations coexist.
 */
const CACHE_KEYS = {
  userList: (page: number) => `users:list:${page}`,
  user: (id: number) => `users:${id}`
}

/**
 * UserRepositoryImpl — 4-layer caching repository.
 *
 * Layer 1: Memory Cache  (<1 ms)   — Hot data, 50 items
 * Layer 2: LRU Cache     (2–5 ms)  — Recent data, 100 items, 5 min TTL
 * Layer 3: IndexedDB     (10–50 ms) — Offline persistence
 * Layer 4: DAO / API     (100 ms+) — Source of truth
 *
 * This class formally `implements IUserRepository` and receives its
 * HTTP access via the injected {@link IUserDao}, keeping HTTP concerns
 * entirely out of the repository layer.
 */
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly dao: IUserDao) {}

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async getUsers(page: number = 1): Promise<UserListResult> {
    const cacheKey = CACHE_KEYS.userList(page)

    // Layer 1
    const memHit = memoryCache.users.get(cacheKey) as UserListResult | undefined
    if (memHit) return memHit

    // Layer 2
    const lruHit = lruCache.users.get(cacheKey) as UserListResult | undefined
    if (lruHit) {
      memoryCache.users.set(cacheKey, lruHit)
      return lruHit
    }

    // Layer 3 — offline fallback
    if (!networkStatus.isOnline.value) {
      const cached = await indexedDbService.getUsers()
      if (cached.length > 0) {
        return {
          users: cached,
          page: 1,
          perPage: cached.length,
          total: cached.length,
          totalPages: 1
        }
      }
    }

    // Layer 4 — fetch via DAO
    const dto = await this.dao.fetchUsers(page)
    const result = userMapper.toListResult(dto)

    memoryCache.users.set(cacheKey, result)
    lruCache.users.set(cacheKey, result)
    await indexedDbService.saveUsers(result.users)

    return result
  }

  async getUserById(id: number): Promise<User> {
    const cacheKey = CACHE_KEYS.user(id)

    // Layer 1
    const memHit = memoryCache.users.get(cacheKey) as User | undefined
    if (memHit) return memHit

    // Layer 2
    const lruHit = lruCache.users.get(cacheKey) as User | undefined
    if (lruHit) {
      memoryCache.users.set(cacheKey, lruHit)
      return lruHit
    }

    // Layer 3 — offline fallback
    if (!networkStatus.isOnline.value) {
      const cached = await indexedDbService.getUserById(id)
      if (cached) return cached
    }

    // Layer 4 — fetch via DAO
    const dto = await this.dao.fetchUserById(id)
    const user = userMapper.toEntity(dto.data)

    memoryCache.users.set(cacheKey, user)
    lruCache.users.set(cacheKey, user)
    await indexedDbService.saveUser(user)

    return user
  }

  // ---------------------------------------------------------------------------
  // Write
  // ---------------------------------------------------------------------------

  async createUser(input: CreateUserInput): Promise<CreatedUser> {
    const requestDto = userMapper.toCreateRequest(input)

    if (!networkStatus.isOnline.value) {
      await indexedDbService.addToSyncQueue({
        type: 'create',
        entityType: 'user',
        entityId: `temp_${Date.now()}`,
        payload: requestDto,
        createdAt: Date.now(),
        retryCount: 0
      })
      return {
        id: `temp_${Date.now()}`,
        name: input.name,
        job: input.job,
        createdAt: new Date().toISOString()
      }
    }

    const responseDto = await this.dao.createUser(requestDto)
    const created = userMapper.toCreatedUser(responseDto)
    this.invalidateListCache()
    return created
  }

  async updateUser(id: number, input: UpdateUserInput): Promise<UpdatedUser> {
    const requestDto = userMapper.toUpdateRequest(input)

    if (!networkStatus.isOnline.value) {
      await indexedDbService.addToSyncQueue({
        type: 'update',
        entityType: 'user',
        entityId: id,
        payload: requestDto,
        createdAt: Date.now(),
        retryCount: 0
      })
      return {
        name: input.name,
        job: input.job,
        updatedAt: new Date().toISOString()
      }
    }

    const responseDto = await this.dao.updateUser(id, requestDto)
    const updated = userMapper.toUpdatedUser(responseDto)

    const cacheKey = CACHE_KEYS.user(id)
    memoryCache.users.delete(cacheKey)
    lruCache.users.delete(cacheKey)
    this.invalidateListCache()

    return updated
  }

  async deleteUser(id: number): Promise<void> {
    if (!networkStatus.isOnline.value) {
      await indexedDbService.addToSyncQueue({
        type: 'delete',
        entityType: 'user',
        entityId: id,
        payload: null,
        createdAt: Date.now(),
        retryCount: 0
      })
      await indexedDbService.deleteUser(id)
      return
    }

    await this.dao.deleteUser(id)

    const cacheKey = CACHE_KEYS.user(id)
    memoryCache.users.delete(cacheKey)
    lruCache.users.delete(cacheKey)
    await indexedDbService.deleteUser(id)
    this.invalidateListCache()
  }

  // ---------------------------------------------------------------------------
  // Cache helpers
  // ---------------------------------------------------------------------------

  invalidateListCache(): void {
    for (const key of memoryCache.users.keys()) {
      if (key.startsWith('users:list:')) memoryCache.users.delete(key)
    }
    lruCache.users.deletePattern(/^users:list:/)
  }

  async clearAllCaches(): Promise<void> {
    memoryCache.users.clear()
    lruCache.users.clear()
    await indexedDbService.clearUsers()
  }

  async prefetchUsers(pages: number[]): Promise<void> {
    await Promise.all(pages.map(p => this.getUsers(p)))
  }
}

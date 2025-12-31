import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userRepository } from '@/data/repositories/user.repository'
import { apiService } from '@/data/api/api.service'
import { memoryCache } from '@/data/cache/memory-cache.service'
import { lruCache } from '@/data/cache/lru-cache.service'
import { indexedDbService } from '@/data/cache/indexed-db.service'
import { networkStatus } from '@/domain/services/network-status.service'
import type { UsersListResponseDto, UserResponseDto, CreateUserResponseDto, UpdateUserResponseDto } from '@/data/dtos/user.dto'

// Mock dependencies
vi.mock('@/data/api/api.service', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/domain/services/network-status.service', () => ({
  networkStatus: {
    isOnline: { value: true }
  }
}))

describe('User Repository', () => {
  const mockUsersResponse: UsersListResponseDto = {
    page: 1,
    per_page: 6,
    total: 12,
    total_pages: 2,
    data: [
      { id: 1, email: 'test1@example.com', first_name: 'John', last_name: 'Doe', avatar: 'https://example.com/1.jpg' },
      { id: 2, email: 'test2@example.com', first_name: 'Jane', last_name: 'Doe', avatar: 'https://example.com/2.jpg' }
    ],
    support: { url: 'https://example.com', text: 'Support' }
  }

  const mockUserResponse: UserResponseDto = {
    data: { id: 1, email: 'test@example.com', first_name: 'John', last_name: 'Doe', avatar: 'https://example.com/1.jpg' },
    support: { url: 'https://example.com', text: 'Support' }
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    memoryCache.users.clear()
    lruCache.users.clear()
    await indexedDbService.clearAll()
    vi.mocked(networkStatus.isOnline).value = true
  })

  describe('getUsers', () => {
    it('should fetch users from API and cache', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUsersResponse)

      const result = await userRepository.getUsers(1)

      expect(apiService.get).toHaveBeenCalledWith('/users?page=1')
      expect(result.users).toHaveLength(2)
      expect(result.page).toBe(1)
      expect(result.totalPages).toBe(2)
    })

    it('should use default page 1', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUsersResponse)

      await userRepository.getUsers()

      expect(apiService.get).toHaveBeenCalledWith('/users?page=1')
    })

    it('should return from memory cache if available', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUsersResponse)

      // First call - fetches from API
      await userRepository.getUsers(1)

      // Second call - should use cache
      await userRepository.getUsers(1)

      // API should only be called once
      expect(apiService.get).toHaveBeenCalledTimes(1)
    })

    it('should return from LRU cache and promote to memory', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUsersResponse)

      // Fetch and cache
      await userRepository.getUsers(1)

      // Clear memory cache but keep LRU
      memoryCache.users.clear()

      // Should get from LRU cache
      const result = await userRepository.getUsers(1)

      expect(result.users).toHaveLength(2)
      // API should only be called once
      expect(apiService.get).toHaveBeenCalledTimes(1)
    })

    it('should use IndexedDB when offline', async () => {
      // Save some data to IndexedDB first
      await indexedDbService.saveUsers([
        { id: 1, email: 'cached@example.com', firstName: 'Cached', lastName: 'User', avatar: '' }
      ])

      // Go offline
      vi.mocked(networkStatus.isOnline).value = false

      const result = await userRepository.getUsers(1)

      expect(result.users).toHaveLength(1)
      expect(result.users[0]?.firstName).toBe('Cached')
      expect(apiService.get).not.toHaveBeenCalled()
    })
  })

  describe('getUserById', () => {
    it('should fetch user from API', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUserResponse)

      const result = await userRepository.getUserById(1)

      expect(apiService.get).toHaveBeenCalledWith('/users/1')
      expect(result.id).toBe(1)
      expect(result.firstName).toBe('John')
    })

    it('should cache user in all layers', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUserResponse)

      await userRepository.getUserById(1)
      const fromCache = await userRepository.getUserById(1)

      expect(apiService.get).toHaveBeenCalledTimes(1)
      expect(fromCache.id).toBe(1)
    })

    it('should use IndexedDB when offline', async () => {
      await indexedDbService.saveUser(
        { id: 5, email: 'offline@example.com', firstName: 'Offline', lastName: 'User', avatar: '' }
      )

      vi.mocked(networkStatus.isOnline).value = false

      const result = await userRepository.getUserById(5)

      expect(result.firstName).toBe('Offline')
      expect(apiService.get).not.toHaveBeenCalled()
    })
  })

  describe('createUser', () => {
    it('should create user via API', async () => {
      const createResponse: CreateUserResponseDto = {
        id: '123',
        name: 'John Doe',
        job: 'Developer',
        createdAt: '2024-01-01'
      }
      vi.mocked(apiService.post).mockResolvedValue(createResponse)

      const result = await userRepository.createUser({ name: 'John Doe', job: 'Developer' })

      expect(apiService.post).toHaveBeenCalledWith('/users', { name: 'John Doe', job: 'Developer' })
      expect(result.id).toBe('123')
    })

    it('should queue for offline sync when offline', async () => {
      vi.mocked(networkStatus.isOnline).value = false

      const result = await userRepository.createUser({ name: 'Offline User', job: 'Dev' })

      expect(apiService.post).not.toHaveBeenCalled()
      expect(result.name).toBe('Offline User')
      expect(result.id).toContain('temp_')

      const syncItems = await indexedDbService.getPendingSyncItems()
      expect(syncItems.length).toBeGreaterThan(0)
      expect(syncItems[0]?.type).toBe('create')
    })
  })

  describe('updateUser', () => {
    it('should update user via API', async () => {
      const updateResponse: UpdateUserResponseDto = {
        name: 'Jane Doe',
        job: 'Designer',
        updatedAt: '2024-01-02'
      }
      vi.mocked(apiService.put).mockResolvedValue(updateResponse)

      const result = await userRepository.updateUser(1, { name: 'Jane Doe', job: 'Designer' })

      expect(apiService.put).toHaveBeenCalledWith('/users/1', { name: 'Jane Doe', job: 'Designer' })
      expect(result.name).toBe('Jane Doe')
    })

    it('should invalidate cache after update', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUserResponse)
      vi.mocked(apiService.put).mockResolvedValue({ name: 'Updated', job: 'Dev', updatedAt: '2024-01-01' })

      // Cache the user first
      await userRepository.getUserById(1)

      // Update
      await userRepository.updateUser(1, { name: 'Updated', job: 'Dev' })

      // Cache should be invalidated
      expect(memoryCache.users.has('users:1')).toBe(false)
    })

    it('should queue for offline sync when offline', async () => {
      vi.mocked(networkStatus.isOnline).value = false

      const result = await userRepository.updateUser(1, { name: 'Offline Update', job: 'Dev' })

      expect(apiService.put).not.toHaveBeenCalled()
      expect(result.name).toBe('Offline Update')

      const syncItems = await indexedDbService.getPendingSyncItems()
      expect(syncItems.some(item => item.type === 'update')).toBe(true)
    })
  })

  describe('deleteUser', () => {
    it('should delete user via API', async () => {
      vi.mocked(apiService.delete).mockResolvedValue(undefined)

      await userRepository.deleteUser(1)

      expect(apiService.delete).toHaveBeenCalledWith('/users/1')
    })

    it('should invalidate cache after delete', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUserResponse)
      vi.mocked(apiService.delete).mockResolvedValue(undefined)

      // Cache the user first
      await userRepository.getUserById(1)

      // Delete
      await userRepository.deleteUser(1)

      // Cache should be invalidated
      expect(memoryCache.users.has('users:1')).toBe(false)
    })

    it('should queue for offline sync when offline', async () => {
      vi.mocked(networkStatus.isOnline).value = false

      await userRepository.deleteUser(1)

      expect(apiService.delete).not.toHaveBeenCalled()

      const syncItems = await indexedDbService.getPendingSyncItems()
      expect(syncItems.some(item => item.type === 'delete')).toBe(true)
    })
  })

  describe('invalidateListCache', () => {
    it('should clear list caches', async () => {
      memoryCache.users.set('users:list:1', { users: [] })
      memoryCache.users.set('users:list:2', { users: [] })
      lruCache.users.set('users:list:1', { users: [] })

      userRepository.invalidateListCache()

      expect(memoryCache.users.has('users:list:1')).toBe(false)
      expect(memoryCache.users.has('users:list:2')).toBe(false)
    })
  })

  describe('clearAllCaches', () => {
    it('should clear all caches', async () => {
      memoryCache.users.set('test', 'value')
      lruCache.users.set('test', 'value')
      await indexedDbService.saveUser(
        { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', avatar: '' }
      )

      await userRepository.clearAllCaches()

      expect(memoryCache.users.size()).toBe(0)
      expect(lruCache.users.size()).toBe(0)
      const users = await indexedDbService.getUsers()
      expect(users).toHaveLength(0)
    })
  })

  describe('prefetchUsers', () => {
    it('should prefetch multiple pages', async () => {
      vi.mocked(apiService.get).mockResolvedValue(mockUsersResponse)

      await userRepository.prefetchUsers([1, 2, 3])

      expect(apiService.get).toHaveBeenCalledTimes(3)
      expect(apiService.get).toHaveBeenCalledWith('/users?page=1')
      expect(apiService.get).toHaveBeenCalledWith('/users?page=2')
      expect(apiService.get).toHaveBeenCalledWith('/users?page=3')
    })
  })
})

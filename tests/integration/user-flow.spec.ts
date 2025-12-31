import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { userRepository } from '@/data/repositories/user.repository'
import { indexedDbService } from '@/data/cache/indexed-db.service'
import type { UsersListResponseDto, UserResponseDto, CreateUserResponseDto, UpdateUserResponseDto } from '@/data/dtos/user.dto'

// Mock API service
vi.mock('@/data/api/api.service', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    getClient: vi.fn(() => ({
      defaults: { baseURL: 'https://reqres.in/api' }
    }))
  }
}))

import { apiService } from '@/data/api/api.service'

describe('User Flow Integration Tests', () => {
  const mockUsersResponse: UsersListResponseDto = {
    page: 1,
    per_page: 6,
    total: 2,
    total_pages: 1,
    data: [
      { id: 1, email: 'john@example.com', first_name: 'John', last_name: 'Doe', avatar: 'https://example.com/1.jpg' },
      { id: 2, email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith', avatar: 'https://example.com/2.jpg' }
    ],
    support: { url: 'https://example.com', text: 'Support' }
  }

  const mockUserResponse: UserResponseDto = {
    data: { id: 1, email: 'john@example.com', first_name: 'John', last_name: 'Doe', avatar: 'https://example.com/1.jpg' },
    support: { url: 'https://example.com', text: 'Support' }
  }

  const mockCreateResponse: CreateUserResponseDto = {
    id: '3',
    name: 'New User',
    job: 'Developer',
    createdAt: new Date().toISOString()
  }

  const mockUpdateResponse: UpdateUserResponseDto = {
    name: 'Updated Name',
    job: 'Designer',
    updatedAt: new Date().toISOString()
  }

  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    // Clear caches
    await userRepository.clearAllCaches()
    await indexedDbService.clearAll()

    // Setup mock responses
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url.includes('/users?page=')) {
        return Promise.resolve(mockUsersResponse)
      }
      if (url.match(/\/users\/\d+$/)) {
        return Promise.resolve(mockUserResponse)
      }
      return Promise.reject(new Error('Not found'))
    })

    vi.mocked(apiService.post).mockResolvedValue(mockCreateResponse)
    vi.mocked(apiService.put).mockResolvedValue(mockUpdateResponse)
    vi.mocked(apiService.delete).mockResolvedValue(undefined)

    // Create router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div><router-view /></div>' },
          children: [
            { path: '', redirect: '/home' },
            { path: 'home', name: 'home', component: { template: '<div>Home</div>' } },
            { path: 'users', name: 'users', component: { template: '<div>Users</div>' } },
            { path: 'users/new', name: 'user-create', component: { template: '<div>Create</div>' } },
            { path: 'users/:id', name: 'user-detail', component: { template: '<div>Detail</div>' } },
            { path: 'users/:id/edit', name: 'user-edit', component: { template: '<div>Edit</div>' } }
          ]
        }
      ]
    })
  })

  describe('Complete User CRUD Flow', () => {
    it('should list users from API', async () => {
      const result = await userRepository.getUsers(1)

      expect(apiService.get).toHaveBeenCalledWith('/users?page=1')
      expect(result.users).toHaveLength(2)
      expect(result.users[0]?.firstName).toBe('John')
      expect(result.users[1]?.firstName).toBe('Jane')
    })

    it('should cache users after fetch', async () => {
      // First call - from API
      await userRepository.getUsers(1)
      expect(apiService.get).toHaveBeenCalledTimes(1)

      // Second call - from cache
      await userRepository.getUsers(1)
      expect(apiService.get).toHaveBeenCalledTimes(1)
    })

    it('should get single user by ID', async () => {
      const user = await userRepository.getUserById(1)

      expect(apiService.get).toHaveBeenCalledWith('/users/1')
      expect(user.id).toBe(1)
      expect(user.firstName).toBe('John')
      expect(user.lastName).toBe('Doe')
    })

    it('should create new user', async () => {
      const result = await userRepository.createUser({
        name: 'New User',
        job: 'Developer'
      })

      expect(apiService.post).toHaveBeenCalledWith('/users', {
        name: 'New User',
        job: 'Developer'
      })
      expect(result.id).toBe('3')
      expect(result.name).toBe('New User')
    })

    it('should update existing user', async () => {
      const result = await userRepository.updateUser(1, {
        name: 'Updated Name',
        job: 'Designer'
      })

      expect(apiService.put).toHaveBeenCalledWith('/users/1', {
        name: 'Updated Name',
        job: 'Designer'
      })
      expect(result.name).toBe('Updated Name')
      expect(result.job).toBe('Designer')
    })

    it('should delete user', async () => {
      await userRepository.deleteUser(1)

      expect(apiService.delete).toHaveBeenCalledWith('/users/1')
    })
  })

  describe('Caching Layer Integration', () => {
    it('should populate all cache layers on fetch', async () => {
      await userRepository.getUsers(1)

      // Memory cache should be populated
      // LRU cache should be populated
      // IndexedDB should be populated

      const indexedDbUsers = await indexedDbService.getUsers()
      expect(indexedDbUsers.length).toBeGreaterThan(0)
    })

    it('should invalidate cache on create', async () => {
      // Populate cache
      await userRepository.getUsers(1)
      vi.mocked(apiService.get).mockClear()

      // Create user (should invalidate list cache)
      await userRepository.createUser({ name: 'Test', job: 'Dev' })

      // Next fetch should hit API
      await userRepository.getUsers(1)
      expect(apiService.get).toHaveBeenCalled()
    })

    it('should invalidate cache on update', async () => {
      // Populate cache
      await userRepository.getUserById(1)
      vi.mocked(apiService.get).mockClear()

      // Update user (should invalidate cache)
      await userRepository.updateUser(1, { name: 'Updated', job: 'Dev' })

      // Next fetch should hit API
      await userRepository.getUserById(1)
      expect(apiService.get).toHaveBeenCalled()
    })

    it('should invalidate cache on delete', async () => {
      // Populate cache
      await userRepository.getUserById(1)

      // Delete user
      await userRepository.deleteUser(1)

      // IndexedDB should not have the user
      const deletedUser = await indexedDbService.getUserById(1)
      expect(deletedUser).toBeUndefined()
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('Network error'))

      await expect(userRepository.getUsers(1)).rejects.toThrow()
    })

    it('should handle 404 errors', async () => {
      vi.mocked(apiService.get).mockRejectedValue({
        response: { status: 404 },
        isAxiosError: true
      })

      await expect(userRepository.getUserById(999)).rejects.toThrow()
    })
  })

  describe('Prefetch Integration', () => {
    it('should prefetch multiple pages', async () => {
      await userRepository.prefetchUsers([1, 2])

      expect(apiService.get).toHaveBeenCalledWith('/users?page=1')
      expect(apiService.get).toHaveBeenCalledWith('/users?page=2')
    })
  })
})

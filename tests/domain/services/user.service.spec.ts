import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUserService, userService } from '@/domain/services/user.service'
import { userRepository } from '@/data/repositories/user.repository'
import type { UserListResult, User } from '@/domain/entities/user.entity'

// Mock the repository
vi.mock('@/data/repositories/user.repository', () => ({
  userRepository: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  }
}))

describe('User Service', () => {
  const mockUsers: User[] = [
    { id: 1, email: 'test1@example.com', firstName: 'John', lastName: 'Doe', avatar: 'https://example.com/1.jpg' },
    { id: 2, email: 'test2@example.com', firstName: 'Jane', lastName: 'Doe', avatar: 'https://example.com/2.jpg' }
  ]

  const mockUserListResult: UserListResult = {
    users: mockUsers,
    page: 1,
    perPage: 6,
    total: 12,
    totalPages: 2
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      const result = await service.getUsers(1)

      expect(userRepository.getUsers).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockUserListResult)
    })

    it('should use default page 1', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      await service.getUsers()

      expect(userRepository.getUsers).toHaveBeenCalledWith(1)
    })

    it('should set isLoading during request', async () => {
      vi.mocked(userRepository.getUsers).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUserListResult), 10))
      )

      const service = useUserService()
      const promise = service.getUsers()

      expect(service.isLoading.value).toBe(true)
      await promise
      expect(service.isLoading.value).toBe(false)
    })

    it('should handle errors', async () => {
      vi.mocked(userRepository.getUsers).mockRejectedValue(new Error('Network error'))

      const service = useUserService()

      await expect(service.getUsers()).rejects.toThrow('Network error')
      expect(service.error.value).not.toBeNull()
    })

    it('should wrap non-Error objects', async () => {
      vi.mocked(userRepository.getUsers).mockRejectedValue('String error')

      const service = useUserService()

      await expect(service.getUsers()).rejects.toThrow('Failed to fetch users')
    })
  })

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      vi.mocked(userRepository.getUserById).mockResolvedValue(mockUsers[0]!)

      const service = useUserService()
      const result = await service.getUserById(1)

      expect(userRepository.getUserById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockUsers[0])
    })

    it('should handle errors', async () => {
      vi.mocked(userRepository.getUserById).mockRejectedValue(new Error('Not found'))

      const service = useUserService()

      await expect(service.getUserById(999)).rejects.toThrow('Not found')
    })

    it('should wrap non-Error objects', async () => {
      vi.mocked(userRepository.getUserById).mockRejectedValue('Error')

      const service = useUserService()

      await expect(service.getUserById(1)).rejects.toThrow('Failed to fetch user')
    })
  })

  describe('createUser', () => {
    it('should create user with valid input', async () => {
      const createdUser = { id: '123', name: 'John', job: 'Developer', createdAt: '2024-01-01' }
      vi.mocked(userRepository.createUser).mockResolvedValue(createdUser)

      const service = useUserService()
      const result = await service.createUser({ name: 'John', job: 'Developer' })

      expect(userRepository.createUser).toHaveBeenCalledWith({ name: 'John', job: 'Developer' })
      expect(result).toEqual(createdUser)
    })

    it('should throw error for invalid input', async () => {
      const service = useUserService()

      await expect(service.createUser({ name: '', job: '' })).rejects.toThrow()
    })

    it('should handle repository errors', async () => {
      vi.mocked(userRepository.createUser).mockRejectedValue(new Error('Create failed'))

      const service = useUserService()

      await expect(service.createUser({ name: 'John', job: 'Dev' })).rejects.toThrow('Create failed')
    })

    it('should wrap non-Error objects', async () => {
      vi.mocked(userRepository.createUser).mockRejectedValue('Error')

      const service = useUserService()

      await expect(service.createUser({ name: 'John', job: 'Dev' })).rejects.toThrow('Failed to create user')
    })
  })

  describe('updateUser', () => {
    it('should update user with valid input', async () => {
      const updatedUser = { name: 'Jane', job: 'Designer', updatedAt: '2024-01-02' }
      vi.mocked(userRepository.updateUser).mockResolvedValue(updatedUser)

      const service = useUserService()
      const result = await service.updateUser(1, { name: 'Jane', job: 'Designer' })

      expect(userRepository.updateUser).toHaveBeenCalledWith(1, { name: 'Jane', job: 'Designer' })
      expect(result).toEqual(updatedUser)
    })

    it('should throw error for invalid input', async () => {
      const service = useUserService()

      await expect(service.updateUser(1, { name: '', job: '' })).rejects.toThrow()
    })

    it('should handle repository errors', async () => {
      vi.mocked(userRepository.updateUser).mockRejectedValue(new Error('Update failed'))

      const service = useUserService()

      await expect(service.updateUser(1, { name: 'Jane', job: 'Dev' })).rejects.toThrow('Update failed')
    })

    it('should wrap non-Error objects', async () => {
      vi.mocked(userRepository.updateUser).mockRejectedValue('Error')

      const service = useUserService()

      await expect(service.updateUser(1, { name: 'Jane', job: 'Dev' })).rejects.toThrow('Failed to update user')
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      vi.mocked(userRepository.deleteUser).mockResolvedValue(undefined)

      const service = useUserService()
      await service.deleteUser(1)

      expect(userRepository.deleteUser).toHaveBeenCalledWith(1)
    })

    it('should handle errors', async () => {
      vi.mocked(userRepository.deleteUser).mockRejectedValue(new Error('Delete failed'))

      const service = useUserService()

      await expect(service.deleteUser(1)).rejects.toThrow('Delete failed')
    })

    it('should wrap non-Error objects', async () => {
      vi.mocked(userRepository.deleteUser).mockRejectedValue('Error')

      const service = useUserService()

      await expect(service.deleteUser(1)).rejects.toThrow('Failed to delete user')
    })
  })

  describe('searchUsers', () => {
    it('should search and filter users', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      const result = await service.searchUsers('John')

      expect(result.users).toHaveLength(1)
      expect(result.users[0]?.firstName).toBe('John')
    })

    it('should return all users for empty query', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      const result = await service.searchUsers('')

      expect(result.users).toHaveLength(2)
    })

    it('should return all users for whitespace query', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      const result = await service.searchUsers('   ')

      expect(result.users).toHaveLength(2)
    })

    it('should search by email', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      const result = await service.searchUsers('test1')

      expect(result.users).toHaveLength(1)
      expect(result.users[0]?.email).toContain('test1')
    })

    it('should search by lastName', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      const result = await service.searchUsers('Doe')

      expect(result.users).toHaveLength(2)
    })

    it('should be case insensitive', async () => {
      vi.mocked(userRepository.getUsers).mockResolvedValue(mockUserListResult)

      const service = useUserService()
      const result = await service.searchUsers('JOHN')

      expect(result.users).toHaveLength(1)
    })

    it('should handle errors', async () => {
      vi.mocked(userRepository.getUsers).mockRejectedValue(new Error('Search failed'))

      const service = useUserService()

      await expect(service.searchUsers('test')).rejects.toThrow('Search failed')
    })

    it('should wrap non-Error objects', async () => {
      vi.mocked(userRepository.getUsers).mockRejectedValue('Error')

      const service = useUserService()

      await expect(service.searchUsers('test')).rejects.toThrow('Failed to search users')
    })
  })

  describe('validateCreateInput', () => {
    it('should validate valid input', () => {
      const service = useUserService()
      const result = service.validateCreateInput({ name: 'John', job: 'Dev' })

      expect(result.isValid).toBe(true)
    })

    it('should invalidate empty input', () => {
      const service = useUserService()
      const result = service.validateCreateInput({ name: '', job: '' })

      expect(result.isValid).toBe(false)
    })
  })

  describe('validateUpdateInput', () => {
    it('should validate valid input', () => {
      const service = useUserService()
      const result = service.validateUpdateInput({ name: 'Jane', job: 'Designer' })

      expect(result.isValid).toBe(true)
    })

    it('should invalidate empty input', () => {
      const service = useUserService()
      const result = service.validateUpdateInput({ name: '', job: '' })

      expect(result.isValid).toBe(false)
    })
  })

  describe('singleton userService', () => {
    it('should be available as singleton', () => {
      expect(userService).toBeDefined()
      expect(userService.getUsers).toBeDefined()
      expect(userService.getUserById).toBeDefined()
      expect(userService.createUser).toBeDefined()
      expect(userService.updateUser).toBeDefined()
      expect(userService.deleteUser).toBeDefined()
      expect(userService.searchUsers).toBeDefined()
    })
  })
})

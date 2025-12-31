import { describe, it, expect } from 'vitest'
import type {
  User,
  UserListResult,
  CreateUserInput,
  UpdateUserInput,
  CreatedUser,
  UpdatedUser
} from '@/domain/entities/user.entity'

describe('User Entity Types', () => {
  describe('User', () => {
    it('should have correct structure', () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://example.com/avatar.jpg'
      }

      expect(user.id).toBe(1)
      expect(user.email).toBe('test@example.com')
      expect(user.firstName).toBe('John')
      expect(user.lastName).toBe('Doe')
      expect(user.avatar).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('UserListResult', () => {
    it('should have correct structure', () => {
      const result: UserListResult = {
        users: [
          {
            id: 1,
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg'
          }
        ],
        page: 1,
        perPage: 6,
        total: 12,
        totalPages: 2
      }

      expect(result.users).toHaveLength(1)
      expect(result.page).toBe(1)
      expect(result.perPage).toBe(6)
      expect(result.total).toBe(12)
      expect(result.totalPages).toBe(2)
    })
  })

  describe('CreateUserInput', () => {
    it('should have correct structure', () => {
      const input: CreateUserInput = {
        name: 'John Doe',
        job: 'Developer'
      }

      expect(input.name).toBe('John Doe')
      expect(input.job).toBe('Developer')
    })
  })

  describe('UpdateUserInput', () => {
    it('should have correct structure', () => {
      const input: UpdateUserInput = {
        name: 'Jane Doe',
        job: 'Designer'
      }

      expect(input.name).toBe('Jane Doe')
      expect(input.job).toBe('Designer')
    })
  })

  describe('CreatedUser', () => {
    it('should have correct structure', () => {
      const created: CreatedUser = {
        id: '123',
        name: 'John Doe',
        job: 'Developer',
        createdAt: '2024-01-01T00:00:00.000Z'
      }

      expect(created.id).toBe('123')
      expect(created.name).toBe('John Doe')
      expect(created.job).toBe('Developer')
      expect(created.createdAt).toBe('2024-01-01T00:00:00.000Z')
    })
  })

  describe('UpdatedUser', () => {
    it('should have correct structure', () => {
      const updated: UpdatedUser = {
        name: 'Jane Doe',
        job: 'Designer',
        updatedAt: '2024-01-02T00:00:00.000Z'
      }

      expect(updated.name).toBe('Jane Doe')
      expect(updated.job).toBe('Designer')
      expect(updated.updatedAt).toBe('2024-01-02T00:00:00.000Z')
    })
  })
})

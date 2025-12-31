import { describe, it, expect } from 'vitest'
import { userMapper } from '@/data/mappers/user.mapper'
import type { UserDto, UsersListResponseDto, CreateUserResponseDto, UpdateUserResponseDto } from '@/data/dtos/user.dto'
import type { User, CreateUserInput, UpdateUserInput } from '@/domain/entities/user.entity'

describe('User Mapper', () => {
  describe('toEntity', () => {
    it('should map UserDto to User entity', () => {
      const dto: UserDto = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.jpg'
      }

      const entity = userMapper.toEntity(dto)

      expect(entity.id).toBe(1)
      expect(entity.email).toBe('test@example.com')
      expect(entity.firstName).toBe('John')
      expect(entity.lastName).toBe('Doe')
      expect(entity.avatar).toBe('https://example.com/avatar.jpg')
    })

    it('should convert snake_case to camelCase', () => {
      const dto: UserDto = {
        id: 2,
        email: 'jane@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: 'https://example.com/jane.jpg'
      }

      const entity = userMapper.toEntity(dto)

      expect(entity.firstName).toBe('Jane')
      expect(entity.lastName).toBe('Smith')
    })
  })

  describe('toDto', () => {
    it('should map User entity to UserDto', () => {
      const entity: User = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://example.com/avatar.jpg'
      }

      const dto = userMapper.toDto(entity)

      expect(dto.id).toBe(1)
      expect(dto.email).toBe('test@example.com')
      expect(dto.first_name).toBe('John')
      expect(dto.last_name).toBe('Doe')
      expect(dto.avatar).toBe('https://example.com/avatar.jpg')
    })

    it('should convert camelCase to snake_case', () => {
      const entity: User = {
        id: 2,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: 'https://example.com/jane.jpg'
      }

      const dto = userMapper.toDto(entity)

      expect(dto.first_name).toBe('Jane')
      expect(dto.last_name).toBe('Smith')
    })
  })

  describe('toListResult', () => {
    it('should map UsersListResponseDto to UserListResult', () => {
      const dto: UsersListResponseDto = {
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

      const result = userMapper.toListResult(dto)

      expect(result.page).toBe(1)
      expect(result.perPage).toBe(6)
      expect(result.total).toBe(12)
      expect(result.totalPages).toBe(2)
      expect(result.users).toHaveLength(2)
      expect(result.users[0]?.firstName).toBe('John')
      expect(result.users[1]?.firstName).toBe('Jane')
    })

    it('should map empty data array', () => {
      const dto: UsersListResponseDto = {
        page: 1,
        per_page: 6,
        total: 0,
        total_pages: 0,
        data: [],
        support: { url: 'https://example.com', text: 'Support' }
      }

      const result = userMapper.toListResult(dto)

      expect(result.users).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('toCreateRequest', () => {
    it('should map CreateUserInput to CreateUserRequestDto', () => {
      const input: CreateUserInput = {
        name: '  John Doe  ',
        job: '  Developer  '
      }

      const request = userMapper.toCreateRequest(input)

      expect(request.name).toBe('John Doe')
      expect(request.job).toBe('Developer')
    })

    it('should trim whitespace', () => {
      const input: CreateUserInput = {
        name: '   Jane   ',
        job: '   Designer   '
      }

      const request = userMapper.toCreateRequest(input)

      expect(request.name).toBe('Jane')
      expect(request.job).toBe('Designer')
    })
  })

  describe('toCreatedUser', () => {
    it('should map CreateUserResponseDto to CreatedUser', () => {
      const dto: CreateUserResponseDto = {
        id: '123',
        name: 'John Doe',
        job: 'Developer',
        createdAt: '2024-01-01T00:00:00.000Z'
      }

      const created = userMapper.toCreatedUser(dto)

      expect(created.id).toBe('123')
      expect(created.name).toBe('John Doe')
      expect(created.job).toBe('Developer')
      expect(created.createdAt).toBe('2024-01-01T00:00:00.000Z')
    })
  })

  describe('toUpdateRequest', () => {
    it('should map UpdateUserInput to UpdateUserRequestDto', () => {
      const input: UpdateUserInput = {
        name: '  Jane Doe  ',
        job: '  Designer  '
      }

      const request = userMapper.toUpdateRequest(input)

      expect(request.name).toBe('Jane Doe')
      expect(request.job).toBe('Designer')
    })

    it('should trim whitespace', () => {
      const input: UpdateUserInput = {
        name: '   Updated Name   ',
        job: '   Updated Job   '
      }

      const request = userMapper.toUpdateRequest(input)

      expect(request.name).toBe('Updated Name')
      expect(request.job).toBe('Updated Job')
    })
  })

  describe('toUpdatedUser', () => {
    it('should map UpdateUserResponseDto to UpdatedUser', () => {
      const dto: UpdateUserResponseDto = {
        name: 'Jane Doe',
        job: 'Designer',
        updatedAt: '2024-01-02T00:00:00.000Z'
      }

      const updated = userMapper.toUpdatedUser(dto)

      expect(updated.name).toBe('Jane Doe')
      expect(updated.job).toBe('Designer')
      expect(updated.updatedAt).toBe('2024-01-02T00:00:00.000Z')
    })
  })
})

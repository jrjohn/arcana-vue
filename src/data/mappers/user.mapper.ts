import type { User, UserListResult, CreateUserInput, UpdateUserInput, CreatedUser, UpdatedUser } from '@/domain/entities/user.entity'
import type {
  UserDto,
  UsersListResponseDto,
  CreateUserRequestDto,
  CreateUserResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto
} from '@/data/dtos/user.dto'

/**
 * User mapper - Converts between DTOs and Domain entities
 * Handles snake_case (API) <-> camelCase (Domain) conversion
 */
export const userMapper = {
  /**
   * Map UserDto to User entity
   */
  toEntity(dto: UserDto): User {
    return {
      id: dto.id,
      email: dto.email,
      firstName: dto.first_name,
      lastName: dto.last_name,
      avatar: dto.avatar
    }
  },

  /**
   * Map User entity to UserDto
   */
  toDto(entity: User): UserDto {
    return {
      id: entity.id,
      email: entity.email,
      first_name: entity.firstName,
      last_name: entity.lastName,
      avatar: entity.avatar
    }
  },

  /**
   * Map UsersListResponseDto to UserListResult
   */
  toListResult(dto: UsersListResponseDto): UserListResult {
    return {
      users: dto.data.map(userDto => this.toEntity(userDto)),
      page: dto.page,
      perPage: dto.per_page,
      total: dto.total,
      totalPages: dto.total_pages
    }
  },

  /**
   * Map CreateUserInput to CreateUserRequestDto
   */
  toCreateRequest(input: CreateUserInput): CreateUserRequestDto {
    return {
      name: input.name.trim(),
      job: input.job.trim()
    }
  },

  /**
   * Map CreateUserResponseDto to CreatedUser
   */
  toCreatedUser(dto: CreateUserResponseDto): CreatedUser {
    return {
      id: dto.id,
      name: dto.name,
      job: dto.job,
      createdAt: dto.createdAt
    }
  },

  /**
   * Map UpdateUserInput to UpdateUserRequestDto
   */
  toUpdateRequest(input: UpdateUserInput): UpdateUserRequestDto {
    return {
      name: input.name.trim(),
      job: input.job.trim()
    }
  },

  /**
   * Map UpdateUserResponseDto to UpdatedUser
   */
  toUpdatedUser(dto: UpdateUserResponseDto): UpdatedUser {
    return {
      name: dto.name,
      job: dto.job,
      updatedAt: dto.updatedAt
    }
  }
}

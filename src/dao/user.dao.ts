import type {
  UsersListResponseDto,
  UserResponseDto,
  CreateUserRequestDto,
  CreateUserResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto
} from '@/data/dtos/user.dto'

/**
 * IUserDao — Data Access Object interface for user HTTP operations.
 *
 * This is the lowest layer: it speaks exclusively in DTOs and raw API
 * primitives.  No domain entities, no caching, no business rules.
 */
export interface IUserDao {
  /**
   * Fetch a paginated list of users from the API.
   * @param page - 1-indexed page number
   */
  fetchUsers(page: number): Promise<UsersListResponseDto>

  /**
   * Fetch a single user by ID from the API.
   * @param id - User ID
   */
  fetchUserById(id: number): Promise<UserResponseDto>

  /**
   * Create a new user via the API.
   * @param data - Serialised create-user request DTO
   */
  createUser(data: CreateUserRequestDto): Promise<CreateUserResponseDto>

  /**
   * Update an existing user via the API.
   * @param id   - User ID
   * @param data - Serialised update-user request DTO
   */
  updateUser(id: number, data: UpdateUserRequestDto): Promise<UpdateUserResponseDto>

  /**
   * Delete a user via the API.
   * @param id - User ID
   */
  deleteUser(id: number): Promise<void>
}

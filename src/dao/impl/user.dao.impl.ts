import type { IApiService } from '@/core/di/types'
import type {
  UsersListResponseDto,
  UserResponseDto,
  CreateUserRequestDto,
  CreateUserResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto
} from '@/data/dtos/user.dto'
import type { IUserDao } from '@/dao/user.dao'

/**
 * UserDaoImpl — Concrete Data Access Object for user HTTP operations.
 *
 * Wraps the shared {@link IApiService} and maps each user-specific
 * endpoint to a strongly-typed method.  This is the only class that
 * is allowed to know about user API URLs.
 */
export class UserDaoImpl implements IUserDao {
  constructor(private readonly api: IApiService) {}

  /** GET /users?page=:page */
  async fetchUsers(page: number): Promise<UsersListResponseDto> {
    return this.api.get<UsersListResponseDto>(`/users?page=${page}`)
  }

  /** GET /users/:id */
  async fetchUserById(id: number): Promise<UserResponseDto> {
    return this.api.get<UserResponseDto>(`/users/${id}`)
  }

  /** POST /users */
  async createUser(data: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    return this.api.post<CreateUserResponseDto>('/users', data)
  }

  /** PUT /users/:id */
  async updateUser(id: number, data: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    return this.api.put<UpdateUserResponseDto>(`/users/${id}`, data)
  }

  /** DELETE /users/:id */
  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`)
  }
}

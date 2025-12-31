import type {
  User,
  UserListResult,
  CreateUserInput,
  UpdateUserInput,
  CreatedUser,
  UpdatedUser
} from '@/domain/entities/user.entity'

/**
 * User Repository Interface
 * Contract for user data operations with caching
 *
 * Note: Method names match existing implementation for backward compatibility
 */
export interface IUserRepository {
  /**
   * Get paginated list of users with 4-layer caching
   * @param page - Page number (1-indexed, default: 1)
   */
  getUsers(page?: number): Promise<UserListResult>

  /**
   * Get single user by ID with caching
   * @param id - User ID
   */
  getUserById(id: number): Promise<User>

  /**
   * Create a new user
   * Queues for sync if offline
   * @param input - User creation data
   */
  createUser(input: CreateUserInput): Promise<CreatedUser>

  /**
   * Update an existing user
   * Queues for sync if offline
   * @param id - User ID
   * @param input - User update data
   */
  updateUser(id: number, input: UpdateUserInput): Promise<UpdatedUser>

  /**
   * Delete a user
   * Queues for sync if offline
   * @param id - User ID
   */
  deleteUser(id: number): Promise<void>

  /**
   * Prefetch users for better UX
   * Loads pages into cache in background
   * @param pages - Array of page numbers to prefetch
   */
  prefetchUsers(pages: number[]): Promise<void>

  /**
   * Invalidate all list caches
   */
  invalidateListCache(): void

  /**
   * Clear all user caches (memory, LRU, IndexedDB)
   */
  clearAllCaches(): Promise<void>
}

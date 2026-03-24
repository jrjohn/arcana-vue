import { ref, computed } from 'vue'
import type { User, UserListResult, CreateUserInput, UpdateUserInput, CreatedUser, UpdatedUser } from '@/domain/entities/user.entity'
import { userValidator } from '@/domain/validators/user.validator'
import type { ValidationResult } from '@/domain/validators/user.validator'
import type { IUserRepository } from '@/repository/user.repository'
// NOTE: This ES-module import creates a circular reference with container.ts
// (container → user.service → decorators → container), but it is safe because
// `useUserRepository()` is only *called* at request-time, after all modules
// have finished evaluating and the container is fully initialised.
import { useUserRepository } from '@/core/di/decorators'

/**
 * Returns the registered IUserRepository from the InversifyJS container.
 * Always called lazily (inside method bodies) — never at module load time.
 */
function getRepository(): IUserRepository {
  return useUserRepository()
}

/**
 * User service — Business logic layer for user operations.
 * Implements the domain layer in Clean Architecture.
 *
 * The concrete repository implementation is never imported here;
 * it is resolved through the InversifyJS container via {@link getRepository}.
 */
export function useUserService() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Get paginated list of users
   */
  async function getUsers(page: number = 1): Promise<UserListResult> {
    isLoading.value = true
    error.value = null

    try {
      return await getRepository().getUsers(page)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to fetch users')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a single user by ID
   */
  async function getUserById(id: number): Promise<User> {
    isLoading.value = true
    error.value = null

    try {
      return await getRepository().getUserById(id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to fetch user')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new user
   */
  async function createUser(input: CreateUserInput): Promise<CreatedUser> {
    const validation = userValidator.validateCreateInput(input)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    isLoading.value = true
    error.value = null

    try {
      return await getRepository().createUser(input)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to create user')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing user
   */
  async function updateUser(id: number, input: UpdateUserInput): Promise<UpdatedUser> {
    const validation = userValidator.validateUpdateInput(input)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    isLoading.value = true
    error.value = null

    try {
      return await getRepository().updateUser(id, input)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to update user')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a user
   */
  async function deleteUser(id: number): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await getRepository().deleteUser(id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to delete user')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search users by query
   */
  async function searchUsers(query: string, page: number = 1): Promise<UserListResult> {
    isLoading.value = true
    error.value = null

    try {
      const result = await getRepository().getUsers(page)

      if (!query.trim()) {
        return result
      }

      const lowerQuery = query.toLowerCase()
      const filteredUsers = result.users.filter(user =>
        user.firstName.toLowerCase().includes(lowerQuery) ||
        user.lastName.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
      )

      return {
        ...result,
        users: filteredUsers,
        total: filteredUsers.length
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to search users')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Methods
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    validateCreateInput,
    validateUpdateInput
  }
}

/**
 * Validate create user input
 */
function validateCreateInput(input: CreateUserInput): ValidationResult {
  return userValidator.validateCreateInput(input)
}

/**
 * Validate update user input
 */
function validateUpdateInput(input: UpdateUserInput): ValidationResult {
  return userValidator.validateUpdateInput(input)
}

// Export singleton instance — resolved lazily so container can be set up first
export const userService = useUserService()

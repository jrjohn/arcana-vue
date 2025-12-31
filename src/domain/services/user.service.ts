import { ref, computed } from 'vue'
import type { User, UserListResult, CreateUserInput, UpdateUserInput, CreatedUser, UpdatedUser } from '@/domain/entities/user.entity'
import { userRepository } from '@/data/repositories/user.repository'
import { userValidator } from '@/domain/validators/user.validator'
import type { ValidationResult } from '@/domain/validators/user.validator'

/**
 * User service - Business logic layer for user operations
 * Implements the domain layer in Clean Architecture
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
      return await userRepository.getUsers(page)
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
      return await userRepository.getUserById(id)
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
    // Validate input
    const validation = userValidator.validateCreateInput(input)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    isLoading.value = true
    error.value = null

    try {
      return await userRepository.createUser(input)
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
    // Validate input
    const validation = userValidator.validateUpdateInput(input)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    isLoading.value = true
    error.value = null

    try {
      return await userRepository.updateUser(id, input)
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
      await userRepository.deleteUser(id)
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
      const result = await userRepository.getUsers(page)

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

// Export singleton instance
export const userService = useUserService()

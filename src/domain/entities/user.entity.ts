/**
 * User entity - Domain model for user data
 * This is the core business entity, independent of any framework or data source
 */
export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  avatar: string
}

/**
 * User list with pagination metadata
 */
export interface UserListResult {
  users: User[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

/**
 * Create user input
 */
export interface CreateUserInput {
  name: string
  job: string
}

/**
 * Update user input
 */
export interface UpdateUserInput {
  name: string
  job: string
}

/**
 * Created user response
 */
export interface CreatedUser {
  id: string
  name: string
  job: string
  createdAt: string
}

/**
 * Updated user response
 */
export interface UpdatedUser {
  name: string
  job: string
  updatedAt: string
}

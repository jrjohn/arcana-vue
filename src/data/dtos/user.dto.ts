/**
 * User DTOs - Data Transfer Objects for API communication
 * Uses snake_case to match API response format
 */

/**
 * User response from API (single user)
 */
export interface UserResponseDto {
  data: UserDto
  support: SupportDto
}

/**
 * Users list response from API
 */
export interface UsersListResponseDto {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: UserDto[]
  support: SupportDto
}

/**
 * User data from API
 */
export interface UserDto {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar: string
}

/**
 * Support info from API
 */
export interface SupportDto {
  url: string
  text: string
}

/**
 * Create user request
 */
export interface CreateUserRequestDto {
  name: string
  job: string
}

/**
 * Create user response
 */
export interface CreateUserResponseDto {
  id: string
  name: string
  job: string
  createdAt: string
}

/**
 * Update user request
 */
export interface UpdateUserRequestDto {
  name: string
  job: string
}

/**
 * Update user response
 */
export interface UpdateUserResponseDto {
  name: string
  job: string
  updatedAt: string
}

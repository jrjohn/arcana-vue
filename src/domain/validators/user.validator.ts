import type { CreateUserInput, UpdateUserInput } from '@/domain/entities/user.entity'
import { sanitizationService } from '@/domain/services/sanitization.service'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  errorKeys: string[]
}

/**
 * Field validation result
 */
interface FieldValidation {
  isValid: boolean
  error?: string
  errorKey?: string
}

/**
 * User validator - Validates user input data
 */
export const userValidator = {
  /**
   * Validate name field
   */
  validateName(name: string): FieldValidation {
    if (!name || !name.trim()) {
      return {
        isValid: false,
        error: 'Name is required',
        errorKey: 'user.form.nameRequired'
      }
    }

    const trimmed = name.trim()

    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: 'Name must be at least 2 characters',
        errorKey: 'user.form.nameTooShort'
      }
    }

    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: 'Name must be less than 100 characters',
        errorKey: 'user.form.nameTooLong'
      }
    }

    if (sanitizationService.containsXss(trimmed)) {
      return {
        isValid: false,
        error: 'Name contains invalid characters',
        errorKey: 'user.form.nameInvalid'
      }
    }

    return { isValid: true }
  },

  /**
   * Validate job field
   */
  validateJob(job: string): FieldValidation {
    if (!job || !job.trim()) {
      return {
        isValid: false,
        error: 'Job title is required',
        errorKey: 'user.form.jobRequired'
      }
    }

    const trimmed = job.trim()

    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: 'Job title must be at least 2 characters',
        errorKey: 'user.form.jobTooShort'
      }
    }

    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: 'Job title must be less than 100 characters',
        errorKey: 'user.form.jobTooLong'
      }
    }

    if (sanitizationService.containsXss(trimmed)) {
      return {
        isValid: false,
        error: 'Job title contains invalid characters',
        errorKey: 'user.form.jobInvalid'
      }
    }

    return { isValid: true }
  },

  /**
   * Validate email field
   */
  validateEmail(email: string): FieldValidation {
    if (!email || !email.trim()) {
      return {
        isValid: false,
        error: 'Email is required',
        errorKey: 'user.form.emailRequired'
      }
    }

    const trimmed = email.trim().toLowerCase()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!emailRegex.test(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid email format',
        errorKey: 'user.form.emailInvalid'
      }
    }

    return { isValid: true }
  },

  /**
   * Validate create user input
   */
  validateCreateInput(input: CreateUserInput): ValidationResult {
    const errors: string[] = []
    const errorKeys: string[] = []

    const nameValidation = this.validateName(input.name)
    if (!nameValidation.isValid && nameValidation.error && nameValidation.errorKey) {
      errors.push(nameValidation.error)
      errorKeys.push(nameValidation.errorKey)
    }

    const jobValidation = this.validateJob(input.job)
    if (!jobValidation.isValid && jobValidation.error && jobValidation.errorKey) {
      errors.push(jobValidation.error)
      errorKeys.push(jobValidation.errorKey)
    }

    return {
      isValid: errors.length === 0,
      errors,
      errorKeys
    }
  },

  /**
   * Validate update user input
   */
  validateUpdateInput(input: UpdateUserInput): ValidationResult {
    return this.validateCreateInput(input)
  }
}

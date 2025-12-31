import { describe, it, expect } from 'vitest'
import { userValidator } from '@/domain/validators/user.validator'

describe('User Validator', () => {
  describe('validateName', () => {
    it('should return invalid for empty name', () => {
      const result = userValidator.validateName('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Name is required')
      expect(result.errorKey).toBe('user.form.nameRequired')
    })

    it('should return invalid for whitespace-only name', () => {
      const result = userValidator.validateName('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Name is required')
    })

    it('should return invalid for name less than 2 characters', () => {
      const result = userValidator.validateName('A')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Name must be at least 2 characters')
      expect(result.errorKey).toBe('user.form.nameTooShort')
    })

    it('should return invalid for name more than 100 characters', () => {
      const longName = 'A'.repeat(101)
      const result = userValidator.validateName(longName)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Name must be less than 100 characters')
      expect(result.errorKey).toBe('user.form.nameTooLong')
    })

    it('should return invalid for name containing XSS', () => {
      const result = userValidator.validateName('<script>alert("xss")</script>')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Name contains invalid characters')
      expect(result.errorKey).toBe('user.form.nameInvalid')
    })

    it('should return valid for valid name', () => {
      const result = userValidator.validateName('John Doe')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
      expect(result.errorKey).toBeUndefined()
    })

    it('should return valid for name with exactly 2 characters', () => {
      const result = userValidator.validateName('Jo')
      expect(result.isValid).toBe(true)
    })

    it('should return valid for name with exactly 100 characters', () => {
      const validName = 'A'.repeat(100)
      const result = userValidator.validateName(validName)
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateJob', () => {
    it('should return invalid for empty job', () => {
      const result = userValidator.validateJob('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Job title is required')
      expect(result.errorKey).toBe('user.form.jobRequired')
    })

    it('should return invalid for whitespace-only job', () => {
      const result = userValidator.validateJob('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Job title is required')
    })

    it('should return invalid for job less than 2 characters', () => {
      const result = userValidator.validateJob('A')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Job title must be at least 2 characters')
      expect(result.errorKey).toBe('user.form.jobTooShort')
    })

    it('should return invalid for job more than 100 characters', () => {
      const longJob = 'Developer'.repeat(20)
      const result = userValidator.validateJob(longJob)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Job title must be less than 100 characters')
      expect(result.errorKey).toBe('user.form.jobTooLong')
    })

    it('should return invalid for job containing XSS', () => {
      const result = userValidator.validateJob('<script>alert("xss")</script>')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Job title contains invalid characters')
      expect(result.errorKey).toBe('user.form.jobInvalid')
    })

    it('should return valid for valid job', () => {
      const result = userValidator.validateJob('Software Developer')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('validateEmail', () => {
    it('should return invalid for empty email', () => {
      const result = userValidator.validateEmail('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Email is required')
      expect(result.errorKey).toBe('user.form.emailRequired')
    })

    it('should return invalid for whitespace-only email', () => {
      const result = userValidator.validateEmail('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('should return invalid for invalid email format', () => {
      const result = userValidator.validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid email format')
      expect(result.errorKey).toBe('user.form.emailInvalid')
    })

    it('should return invalid for email without domain', () => {
      const result = userValidator.validateEmail('test@')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid email format')
    })

    it('should return invalid for email without @ symbol', () => {
      const result = userValidator.validateEmail('testexample.com')
      expect(result.isValid).toBe(false)
    })

    it('should return valid for valid email', () => {
      const result = userValidator.validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return valid for email with subdomain', () => {
      const result = userValidator.validateEmail('test@mail.example.com')
      expect(result.isValid).toBe(true)
    })

    it('should normalize email to lowercase', () => {
      const result = userValidator.validateEmail('TEST@EXAMPLE.COM')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateCreateInput', () => {
    it('should return valid for valid input', () => {
      const result = userValidator.validateCreateInput({
        name: 'John Doe',
        job: 'Developer'
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.errorKeys).toHaveLength(0)
    })

    it('should return invalid for empty name', () => {
      const result = userValidator.validateCreateInput({
        name: '',
        job: 'Developer'
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Name is required')
      expect(result.errorKeys).toContain('user.form.nameRequired')
    })

    it('should return invalid for empty job', () => {
      const result = userValidator.validateCreateInput({
        name: 'John Doe',
        job: ''
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Job title is required')
      expect(result.errorKeys).toContain('user.form.jobRequired')
    })

    it('should return multiple errors for invalid input', () => {
      const result = userValidator.validateCreateInput({
        name: '',
        job: ''
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errorKeys).toHaveLength(2)
    })
  })

  describe('validateUpdateInput', () => {
    it('should return valid for valid input', () => {
      const result = userValidator.validateUpdateInput({
        name: 'Jane Doe',
        job: 'Designer'
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return invalid for invalid input', () => {
      const result = userValidator.validateUpdateInput({
        name: '',
        job: ''
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})

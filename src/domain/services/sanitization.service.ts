/**
 * Sanitization service - Security utilities for input sanitization
 * Prevents XSS, SQL injection, and other security vulnerabilities
 */

/**
 * Dangerous HTML patterns that could lead to XSS
 */
const DANGEROUS_HTML_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /data:\s*text\/html/gi
]

/**
 * SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/gi,
  /(['";]|\-\-|\/\*|\*\/)/g,
  /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s+\d+\s*=\s*\d+)/gi
]

/**
 * Path traversal patterns
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/,
  /%2e%2e%2f/gi,
  /%2e%2e\//gi,
  /\.\.%2f/gi,
  /%2e%2e%5c/gi
]

export const sanitizationService = {
  /**
   * Sanitize HTML content by removing dangerous patterns
   */
  sanitizeHtml(input: string): string {
    if (!input) return ''

    let sanitized = input

    // Remove dangerous patterns
    DANGEROUS_HTML_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })

    // Encode remaining HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')

    return sanitized
  },

  /**
   * Sanitize text input (for plain text fields)
   */
  sanitizeText(input: string): string {
    if (!input) return ''

    return input
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
  },

  /**
   * Sanitize URL
   */
  sanitizeUrl(input: string): string {
    if (!input) return ''

    const trimmed = input.trim().toLowerCase()

    // Block dangerous protocols
    if (
      trimmed.startsWith('javascript:') ||
      trimmed.startsWith('vbscript:') ||
      trimmed.startsWith('data:text/html')
    ) {
      return ''
    }

    // Only allow http, https, mailto, tel
    if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('mailto:') &&
      !trimmed.startsWith('tel:') &&
      !trimmed.startsWith('/')
    ) {
      // If no protocol, assume relative URL
      if (!trimmed.includes(':')) {
        return input.trim()
      }
      return ''
    }

    return input.trim()
  },

  /**
   * Sanitize email
   */
  sanitizeEmail(input: string): string {
    if (!input) return ''

    const trimmed = input.trim().toLowerCase()

    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(trimmed)) {
      return ''
    }

    return trimmed
  },

  /**
   * Sanitize filename to prevent path traversal
   */
  sanitizeFilename(input: string): string {
    if (!input) return ''

    let sanitized = input.trim()

    // Remove path traversal patterns
    PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })

    // Remove directory separators
    sanitized = sanitized.replace(/[\/\\]/g, '')

    // Remove null bytes
    sanitized = sanitized.replace(/\x00/g, '')

    // Only allow safe characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

    return sanitized
  },

  /**
   * Check if input contains SQL injection patterns
   */
  containsSqlInjection(input: string): boolean {
    if (!input) return false

    return SQL_INJECTION_PATTERNS.some(pattern => {
      pattern.lastIndex = 0 // Reset stateful regex
      return pattern.test(input)
    })
  },

  /**
   * Check if input contains XSS patterns
   */
  containsXss(input: string): boolean {
    if (!input) return false

    return DANGEROUS_HTML_PATTERNS.some(pattern => {
      pattern.lastIndex = 0 // Reset stateful regex
      return pattern.test(input)
    })
  },

  /**
   * Sanitize object properties recursively
   */
  sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = { ...obj } as T

    for (const key of Object.keys(sanitized)) {
      const value = sanitized[key as keyof T]

      if (typeof value === 'string') {
        (sanitized as Record<string, unknown>)[key] = this.sanitizeText(value)
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        (sanitized as Record<string, unknown>)[key] = this.sanitizeObject(value as Record<string, unknown>)
      } else if (Array.isArray(value)) {
        (sanitized as Record<string, unknown>)[key] = value.map(item =>
          typeof item === 'string'
            ? this.sanitizeText(item)
            : item && typeof item === 'object'
              ? this.sanitizeObject(item as Record<string, unknown>)
              : item
        )
      }
    }

    return sanitized
  },

  /**
   * Escape string for use in regex
   */
  escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  },

  /**
   * Validate and sanitize integer input
   */
  sanitizeInteger(input: string | number, min?: number, max?: number): number | null {
    const num = typeof input === 'string' ? parseInt(input, 10) : input

    if (isNaN(num)) return null
    if (min !== undefined && num < min) return null
    if (max !== undefined && num > max) return null

    return num
  }
}

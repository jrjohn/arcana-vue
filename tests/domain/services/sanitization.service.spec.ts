import { describe, it, expect } from 'vitest'
import { sanitizationService } from '@/domain/services/sanitization.service'

describe('Sanitization Service', () => {
  describe('sanitizeHtml', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizationService.sanitizeHtml('')).toBe('')
    })

    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).not.toContain('script')
      expect(result).not.toContain('alert')
    })

    it('should remove iframe tags', () => {
      const input = '<iframe src="http://evil.com"></iframe>'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).not.toContain('iframe')
    })

    it('should remove object tags', () => {
      const input = '<object data="evil.swf"></object>'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).not.toContain('object')
    })

    it('should remove embed tags', () => {
      const input = '<embed src="evil.swf">'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).not.toContain('embed')
    })

    it('should remove javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">Click</a>'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).not.toContain('javascript:')
    })

    it('should remove vbscript: URLs', () => {
      const input = '<a href="vbscript:msgbox(1)">Click</a>'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).not.toContain('vbscript:')
    })

    it('should remove on* event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).not.toContain('onclick')
    })

    it('should encode HTML entities', () => {
      const input = '<div>Test & "quote"</div>'
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
      expect(result).toContain('&amp;')
      expect(result).toContain('&quot;')
    })

    it('should encode single quotes', () => {
      const input = "Test's value"
      const result = sanitizationService.sanitizeHtml(input)
      expect(result).toContain('&#x27;')
    })
  })

  describe('sanitizeText', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizationService.sanitizeText('')).toBe('')
    })

    it('should trim whitespace', () => {
      expect(sanitizationService.sanitizeText('  hello  ')).toBe('hello')
    })

    it('should normalize multiple spaces', () => {
      expect(sanitizationService.sanitizeText('hello    world')).toBe('hello world')
    })

    it('should remove control characters', () => {
      const input = 'hello\x00\x08world'
      const result = sanitizationService.sanitizeText(input)
      expect(result).toBe('helloworld')
    })

    it('should preserve normal text', () => {
      expect(sanitizationService.sanitizeText('Hello World')).toBe('Hello World')
    })
  })

  describe('sanitizeUrl', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizationService.sanitizeUrl('')).toBe('')
    })

    it('should block javascript: URLs', () => {
      expect(sanitizationService.sanitizeUrl('javascript:alert(1)')).toBe('')
    })

    it('should block vbscript: URLs', () => {
      expect(sanitizationService.sanitizeUrl('vbscript:msgbox(1)')).toBe('')
    })

    it('should block data:text/html URLs', () => {
      expect(sanitizationService.sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should allow http URLs', () => {
      expect(sanitizationService.sanitizeUrl('http://example.com')).toBe('http://example.com')
    })

    it('should allow https URLs', () => {
      expect(sanitizationService.sanitizeUrl('https://example.com')).toBe('https://example.com')
    })

    it('should allow mailto URLs', () => {
      expect(sanitizationService.sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
    })

    it('should allow tel URLs', () => {
      expect(sanitizationService.sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890')
    })

    it('should allow relative URLs', () => {
      expect(sanitizationService.sanitizeUrl('/path/to/page')).toBe('/path/to/page')
    })

    it('should trim whitespace', () => {
      expect(sanitizationService.sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
    })

    it('should allow relative URLs without protocol', () => {
      expect(sanitizationService.sanitizeUrl('path/to/page')).toBe('path/to/page')
    })

    it('should block unknown protocols', () => {
      expect(sanitizationService.sanitizeUrl('ftp://example.com')).toBe('')
    })
  })

  describe('sanitizeEmail', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizationService.sanitizeEmail('')).toBe('')
    })

    it('should return empty string for invalid email', () => {
      expect(sanitizationService.sanitizeEmail('not-an-email')).toBe('')
    })

    it('should return empty string for email without @', () => {
      expect(sanitizationService.sanitizeEmail('testexample.com')).toBe('')
    })

    it('should return valid email lowercase', () => {
      expect(sanitizationService.sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      expect(sanitizationService.sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('should accept valid email', () => {
      expect(sanitizationService.sanitizeEmail('user@domain.com')).toBe('user@domain.com')
    })

    it('should accept email with subdomain', () => {
      expect(sanitizationService.sanitizeEmail('user@mail.domain.com')).toBe('user@mail.domain.com')
    })

    it('should accept email with plus sign', () => {
      expect(sanitizationService.sanitizeEmail('user+tag@domain.com')).toBe('user+tag@domain.com')
    })
  })

  describe('sanitizeFilename', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizationService.sanitizeFilename('')).toBe('')
    })

    it('should remove path traversal patterns', () => {
      expect(sanitizationService.sanitizeFilename('../etc/passwd')).toBe('etcpasswd')
    })

    it('should remove backslash traversal', () => {
      expect(sanitizationService.sanitizeFilename('..\\Windows\\System32')).toBe('WindowsSystem32')
    })

    it('should remove encoded traversal', () => {
      expect(sanitizationService.sanitizeFilename('%2e%2e%2fetc')).toBe('etc')
    })

    it('should remove directory separators', () => {
      expect(sanitizationService.sanitizeFilename('path/to/file.txt')).toBe('pathtofile.txt')
    })

    it('should remove null bytes', () => {
      expect(sanitizationService.sanitizeFilename('file\x00.txt')).toBe('file.txt')
    })

    it('should replace special characters with underscore', () => {
      expect(sanitizationService.sanitizeFilename('file<>:"|?*.txt')).toBe('file_______.txt')
    })

    it('should allow safe characters', () => {
      expect(sanitizationService.sanitizeFilename('my-file_2024.txt')).toBe('my-file_2024.txt')
    })

    it('should trim whitespace', () => {
      expect(sanitizationService.sanitizeFilename('  file.txt  ')).toBe('file.txt')
    })
  })

  describe('containsSqlInjection', () => {
    it('should return false for empty input', () => {
      expect(sanitizationService.containsSqlInjection('')).toBe(false)
    })

    it('should detect SELECT statement', () => {
      expect(sanitizationService.containsSqlInjection('SELECT * FROM users')).toBe(true)
    })

    it('should detect INSERT statement', () => {
      // The regex requires word boundary, so it needs context
      expect(sanitizationService.containsSqlInjection('1; INSERT INTO users')).toBe(true)
    })

    it('should detect DROP statement', () => {
      expect(sanitizationService.containsSqlInjection('DROP TABLE users')).toBe(true)
    })

    it('should detect UNION statement', () => {
      expect(sanitizationService.containsSqlInjection('UNION SELECT password')).toBe(true)
    })

    it('should detect SQL comment', () => {
      expect(sanitizationService.containsSqlInjection("admin'--")).toBe(true)
    })

    it('should detect OR injection', () => {
      expect(sanitizationService.containsSqlInjection('OR 1=1')).toBe(true)
    })

    it('should detect AND injection', () => {
      expect(sanitizationService.containsSqlInjection('AND 1=1')).toBe(true)
    })

    it('should return false for normal text', () => {
      expect(sanitizationService.containsSqlInjection('Hello World')).toBe(false)
    })
  })

  describe('containsXss', () => {
    it('should return false for empty input', () => {
      expect(sanitizationService.containsXss('')).toBe(false)
    })

    it('should detect script tags', () => {
      expect(sanitizationService.containsXss('<script>alert(1)</script>')).toBe(true)
    })

    it('should detect iframe tags', () => {
      // iframe pattern requires closing tag
      expect(sanitizationService.containsXss('<iframe src="evil"></iframe>')).toBe(true)
    })

    it('should detect javascript: URLs', () => {
      expect(sanitizationService.containsXss('javascript:alert(1)')).toBe(true)
    })

    it('should detect onclick handlers', () => {
      expect(sanitizationService.containsXss('onclick=alert(1)')).toBe(true)
    })

    it('should detect onerror handlers', () => {
      expect(sanitizationService.containsXss('onerror=alert(1)')).toBe(true)
    })

    it('should return false for normal text', () => {
      expect(sanitizationService.containsXss('Hello World')).toBe(false)
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize string properties', () => {
      const obj = { name: '  John  ', job: '  Developer  ' }
      const result = sanitizationService.sanitizeObject(obj)
      expect(result.name).toBe('John')
      expect(result.job).toBe('Developer')
    })

    it('should preserve non-string properties', () => {
      const obj = { id: 123, active: true }
      const result = sanitizationService.sanitizeObject(obj)
      expect(result.id).toBe(123)
      expect(result.active).toBe(true)
    })

    it('should sanitize nested objects', () => {
      const obj = { user: { name: '  John  ' } }
      const result = sanitizationService.sanitizeObject(obj)
      expect((result.user as { name: string }).name).toBe('John')
    })

    it('should sanitize arrays of strings', () => {
      const obj = { tags: ['  tag1  ', '  tag2  '] }
      const result = sanitizationService.sanitizeObject(obj)
      expect(result.tags).toEqual(['tag1', 'tag2'])
    })

    it('should sanitize arrays of objects', () => {
      const obj = { users: [{ name: '  John  ' }] }
      const result = sanitizationService.sanitizeObject(obj)
      expect((result.users as Array<{ name: string }>)[0]?.name).toBe('John')
    })

    it('should preserve arrays of non-objects', () => {
      const obj = { numbers: [1, 2, 3] }
      const result = sanitizationService.sanitizeObject(obj)
      expect(result.numbers).toEqual([1, 2, 3])
    })
  })

  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      expect(sanitizationService.escapeRegex('a.b')).toBe('a\\.b')
      expect(sanitizationService.escapeRegex('a*b')).toBe('a\\*b')
      expect(sanitizationService.escapeRegex('a+b')).toBe('a\\+b')
      expect(sanitizationService.escapeRegex('a?b')).toBe('a\\?b')
      expect(sanitizationService.escapeRegex('a^b')).toBe('a\\^b')
      expect(sanitizationService.escapeRegex('a$b')).toBe('a\\$b')
      expect(sanitizationService.escapeRegex('a{b}')).toBe('a\\{b\\}')
      expect(sanitizationService.escapeRegex('a(b)')).toBe('a\\(b\\)')
      expect(sanitizationService.escapeRegex('a|b')).toBe('a\\|b')
      expect(sanitizationService.escapeRegex('a[b]')).toBe('a\\[b\\]')
      expect(sanitizationService.escapeRegex('a\\b')).toBe('a\\\\b')
    })

    it('should preserve normal characters', () => {
      expect(sanitizationService.escapeRegex('hello world')).toBe('hello world')
    })
  })

  describe('sanitizeInteger', () => {
    it('should return number for valid integer', () => {
      expect(sanitizationService.sanitizeInteger(42)).toBe(42)
    })

    it('should parse string to integer', () => {
      expect(sanitizationService.sanitizeInteger('42')).toBe(42)
    })

    it('should return null for non-numeric string', () => {
      expect(sanitizationService.sanitizeInteger('abc')).toBeNull()
    })

    it('should return null for NaN', () => {
      expect(sanitizationService.sanitizeInteger(NaN)).toBeNull()
    })

    it('should return null for value below min', () => {
      expect(sanitizationService.sanitizeInteger(5, 10)).toBeNull()
    })

    it('should return null for value above max', () => {
      expect(sanitizationService.sanitizeInteger(15, 0, 10)).toBeNull()
    })

    it('should return value within range', () => {
      expect(sanitizationService.sanitizeInteger(5, 0, 10)).toBe(5)
    })

    it('should accept value at min boundary', () => {
      expect(sanitizationService.sanitizeInteger(0, 0, 10)).toBe(0)
    })

    it('should accept value at max boundary', () => {
      expect(sanitizationService.sanitizeInteger(10, 0, 10)).toBe(10)
    })
  })
})

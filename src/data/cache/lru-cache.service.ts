/**
 * LRU Cache - Layer 2 caching
 * Least Recently Used cache with TTL
 * Access time: 2-5ms
 */

interface LruEntry<T> {
  value: T
  timestamp: number
  expiresAt: number
}

const DEFAULT_MAX_SIZE = 100
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export class LruCache<T> {
  private cache: Map<string, LruEntry<T>>
  private maxSize: number
  private defaultTtl: number

  constructor(maxSize: number = DEFAULT_MAX_SIZE, defaultTtl: number = DEFAULT_TTL) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTtl = defaultTtl
  }

  /**
   * Get value from cache (promotes to most recently used)
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }

    // Promote to most recently used
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    // Delete existing entry to reset position
    this.cache.delete(key)

    // Evict LRU entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const now = Date.now()
    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + (ttl ?? this.defaultTtl)
    })
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Delete entries matching pattern
   */
  deletePattern(pattern: RegExp): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now()
    let count = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; maxSize: number; defaultTtl: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTtl: this.defaultTtl
    }
  }
}

// Export singleton instances for common use cases
export const lruCache = {
  users: new LruCache<unknown>(100, 5 * 60 * 1000),
  general: new LruCache<unknown>(200, 10 * 60 * 1000)
}

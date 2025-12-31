/**
 * Memory Cache - Layer 1 caching
 * Fast in-memory cache with FIFO eviction
 * Access time: <1ms
 */

interface CacheEntry<T> {
  value: T
  timestamp: number
}

const DEFAULT_MAX_SIZE = 50

export class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    return entry?.value
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Delete entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get all values
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value)
  }
}

// Export singleton instances for common use cases
export const memoryCache = {
  users: new MemoryCache<unknown>(50),
  general: new MemoryCache<unknown>(100)
}

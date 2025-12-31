import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { LruCache, lruCache } from '@/data/cache/lru-cache.service'

describe('LRU Cache Service', () => {
  describe('LruCache class', () => {
    let cache: LruCache<string>

    beforeEach(() => {
      vi.useFakeTimers()
      cache = new LruCache<string>(3, 1000) // 3 items, 1 second TTL
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('set and get', () => {
      it('should store and retrieve values', () => {
        cache.set('key1', 'value1')
        expect(cache.get('key1')).toBe('value1')
      })

      it('should return undefined for non-existent keys', () => {
        expect(cache.get('nonexistent')).toBeUndefined()
      })

      it('should overwrite existing values', () => {
        cache.set('key1', 'value1')
        cache.set('key1', 'value2')
        expect(cache.get('key1')).toBe('value2')
      })
    })

    describe('TTL expiration', () => {
      it('should return value before TTL expires', () => {
        cache.set('key1', 'value1')
        vi.advanceTimersByTime(500) // Half of TTL
        expect(cache.get('key1')).toBe('value1')
      })

      it('should return undefined after TTL expires', () => {
        cache.set('key1', 'value1')
        vi.advanceTimersByTime(1001) // Just past TTL
        expect(cache.get('key1')).toBeUndefined()
      })

      it('should use custom TTL when provided', () => {
        cache.set('key1', 'value1', 500) // 500ms TTL
        vi.advanceTimersByTime(400)
        expect(cache.get('key1')).toBe('value1')
        vi.advanceTimersByTime(200)
        expect(cache.get('key1')).toBeUndefined()
      })
    })

    describe('has', () => {
      it('should return true for existing non-expired keys', () => {
        cache.set('key1', 'value1')
        expect(cache.has('key1')).toBe(true)
      })

      it('should return false for non-existent keys', () => {
        expect(cache.has('nonexistent')).toBe(false)
      })

      it('should return false for expired keys', () => {
        cache.set('key1', 'value1')
        vi.advanceTimersByTime(1001)
        expect(cache.has('key1')).toBe(false)
      })
    })

    describe('delete', () => {
      it('should delete existing key', () => {
        cache.set('key1', 'value1')
        const result = cache.delete('key1')
        expect(result).toBe(true)
        expect(cache.has('key1')).toBe(false)
      })

      it('should return false for non-existent key', () => {
        const result = cache.delete('nonexistent')
        expect(result).toBe(false)
      })
    })

    describe('deletePattern', () => {
      it('should delete keys matching pattern', () => {
        cache.set('users:1', 'user1')
        cache.set('users:2', 'user2')
        cache.set('posts:1', 'post1')

        const count = cache.deletePattern(/^users:/)

        expect(count).toBe(2)
        expect(cache.has('users:1')).toBe(false)
        expect(cache.has('users:2')).toBe(false)
        expect(cache.has('posts:1')).toBe(true)
      })

      it('should return 0 for no matches', () => {
        cache.set('key1', 'value1')
        const count = cache.deletePattern(/^nonexistent/)
        expect(count).toBe(0)
      })
    })

    describe('clear', () => {
      it('should clear all entries', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.clear()
        expect(cache.size()).toBe(0)
      })
    })

    describe('clearExpired', () => {
      it('should clear only expired entries', () => {
        cache.set('key1', 'value1', 500)
        cache.set('key2', 'value2', 2000)

        vi.advanceTimersByTime(700)
        const count = cache.clearExpired()

        expect(count).toBe(1)
        expect(cache.has('key1')).toBe(false)
        expect(cache.has('key2')).toBe(true)
      })

      it('should return 0 when no entries expired', () => {
        cache.set('key1', 'value1')
        const count = cache.clearExpired()
        expect(count).toBe(0)
      })
    })

    describe('size', () => {
      it('should return correct size', () => {
        expect(cache.size()).toBe(0)
        cache.set('key1', 'value1')
        expect(cache.size()).toBe(1)
      })
    })

    describe('stats', () => {
      it('should return cache stats', () => {
        cache.set('key1', 'value1')
        const stats = cache.stats()

        expect(stats.size).toBe(1)
        expect(stats.maxSize).toBe(3)
        expect(stats.defaultTtl).toBe(1000)
      })
    })

    describe('LRU eviction', () => {
      it('should evict least recently used entry when at capacity', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.set('key3', 'value3')

        // Access key1 to make it recently used
        cache.get('key1')

        // Add key4, should evict key2 (least recently used)
        cache.set('key4', 'value4')

        expect(cache.has('key1')).toBe(true)
        expect(cache.has('key2')).toBe(false) // Evicted
        expect(cache.has('key3')).toBe(true)
        expect(cache.has('key4')).toBe(true)
      })

      it('should promote accessed entry to most recently used', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.set('key3', 'value3')

        // Access key1 multiple times
        cache.get('key1')
        cache.get('key1')

        // Add two more keys, should evict key2 and key3
        cache.set('key4', 'value4')
        cache.set('key5', 'value5')

        expect(cache.has('key1')).toBe(true)
        expect(cache.has('key4')).toBe(true)
        expect(cache.has('key5')).toBe(true)
      })
    })

    describe('default values', () => {
      it('should use default max size of 100 and TTL of 5 minutes', () => {
        const defaultCache = new LruCache<string>()
        const stats = defaultCache.stats()
        expect(stats.maxSize).toBe(100)
        expect(stats.defaultTtl).toBe(5 * 60 * 1000)
      })
    })
  })

  describe('lruCache singleton', () => {
    beforeEach(() => {
      lruCache.users.clear()
      lruCache.general.clear()
    })

    it('should have users cache', () => {
      expect(lruCache.users).toBeDefined()
      lruCache.users.set('test', { id: 1 })
      expect(lruCache.users.get('test')).toEqual({ id: 1 })
    })

    it('should have general cache', () => {
      expect(lruCache.general).toBeDefined()
      lruCache.general.set('test', 'value')
      expect(lruCache.general.get('test')).toBe('value')
    })

    it('users cache should have 5 minute TTL', () => {
      const stats = lruCache.users.stats()
      expect(stats.defaultTtl).toBe(5 * 60 * 1000)
    })

    it('general cache should have 10 minute TTL', () => {
      const stats = lruCache.general.stats()
      expect(stats.defaultTtl).toBe(10 * 60 * 1000)
    })
  })
})

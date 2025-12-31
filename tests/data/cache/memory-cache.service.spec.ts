import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryCache, memoryCache } from '@/data/cache/memory-cache.service'

describe('Memory Cache Service', () => {
  describe('MemoryCache class', () => {
    let cache: MemoryCache<string>

    beforeEach(() => {
      cache = new MemoryCache<string>(3)
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

    describe('has', () => {
      it('should return true for existing keys', () => {
        cache.set('key1', 'value1')
        expect(cache.has('key1')).toBe(true)
      })

      it('should return false for non-existent keys', () => {
        expect(cache.has('nonexistent')).toBe(false)
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

    describe('clear', () => {
      it('should clear all entries', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.clear()
        expect(cache.size()).toBe(0)
      })
    })

    describe('size', () => {
      it('should return correct size', () => {
        expect(cache.size()).toBe(0)
        cache.set('key1', 'value1')
        expect(cache.size()).toBe(1)
        cache.set('key2', 'value2')
        expect(cache.size()).toBe(2)
      })
    })

    describe('keys', () => {
      it('should return all keys', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        const keys = cache.keys()
        expect(keys).toContain('key1')
        expect(keys).toContain('key2')
        expect(keys).toHaveLength(2)
      })
    })

    describe('values', () => {
      it('should return all values', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        const values = cache.values()
        expect(values).toContain('value1')
        expect(values).toContain('value2')
        expect(values).toHaveLength(2)
      })
    })

    describe('FIFO eviction', () => {
      it('should evict oldest entry when at capacity', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.set('key3', 'value3')
        cache.set('key4', 'value4') // This should evict key1

        expect(cache.has('key1')).toBe(false)
        expect(cache.has('key2')).toBe(true)
        expect(cache.has('key3')).toBe(true)
        expect(cache.has('key4')).toBe(true)
        expect(cache.size()).toBe(3)
      })

      it('should not evict when updating existing key', () => {
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.set('key3', 'value3')
        cache.set('key1', 'updated') // Update existing key

        expect(cache.has('key1')).toBe(true)
        expect(cache.get('key1')).toBe('updated')
        expect(cache.size()).toBe(3)
      })
    })

    describe('default max size', () => {
      it('should use default max size of 50', () => {
        const defaultCache = new MemoryCache<string>()
        for (let i = 0; i < 55; i++) {
          defaultCache.set(`key${i}`, `value${i}`)
        }
        expect(defaultCache.size()).toBe(50)
      })
    })
  })

  describe('memoryCache singleton', () => {
    beforeEach(() => {
      memoryCache.users.clear()
      memoryCache.general.clear()
    })

    it('should have users cache', () => {
      expect(memoryCache.users).toBeDefined()
      memoryCache.users.set('test', { id: 1 })
      expect(memoryCache.users.get('test')).toEqual({ id: 1 })
    })

    it('should have general cache', () => {
      expect(memoryCache.general).toBeDefined()
      memoryCache.general.set('test', 'value')
      expect(memoryCache.general.get('test')).toBe('value')
    })
  })
})

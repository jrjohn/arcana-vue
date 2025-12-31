import Dexie, { type Table } from 'dexie'
import type { User } from '@/domain/entities/user.entity'

/**
 * IndexedDB Cache - Layer 3 caching
 * Persistent offline storage via Dexie.js
 * Access time: 10-50ms
 */

/**
 * Cached user with metadata
 */
interface CachedUser extends User {
  cachedAt: number
  syncStatus: 'synced' | 'pending' | 'error'
}

/**
 * Offline sync queue item
 */
interface SyncQueueItem {
  id?: number
  type: 'create' | 'update' | 'delete'
  entityType: 'user'
  entityId: number | string
  payload: unknown
  createdAt: number
  retryCount: number
  lastError?: string
}

/**
 * Cache metadata
 */
interface CacheMetadata {
  key: string
  value: string
  updatedAt: number
}

/**
 * Arcana Database - Dexie instance
 */
class ArcanaDatabase extends Dexie {
  users!: Table<CachedUser, number>
  syncQueue!: Table<SyncQueueItem, number>
  metadata!: Table<CacheMetadata, string>

  constructor() {
    super('ArcanaDB')

    this.version(1).stores({
      users: 'id, email, firstName, lastName, cachedAt, syncStatus',
      syncQueue: '++id, type, entityType, entityId, createdAt',
      metadata: 'key'
    })
  }
}

const db = new ArcanaDatabase()

/**
 * IndexedDB service for offline data persistence
 */
export const indexedDbService = {
  /**
   * Get all cached users
   */
  async getUsers(): Promise<CachedUser[]> {
    try {
      return await db.users.toArray()
    } catch (error) {
      console.error('IndexedDB getUsers error:', error)
      return []
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<CachedUser | undefined> {
    try {
      return await db.users.get(id)
    } catch (error) {
      console.error('IndexedDB getUserById error:', error)
      return undefined
    }
  },

  /**
   * Save user to cache
   */
  async saveUser(user: User, syncStatus: 'synced' | 'pending' | 'error' = 'synced'): Promise<void> {
    try {
      await db.users.put({
        ...user,
        cachedAt: Date.now(),
        syncStatus
      })
    } catch (error) {
      console.error('IndexedDB saveUser error:', error)
    }
  },

  /**
   * Save multiple users to cache
   */
  async saveUsers(users: User[]): Promise<void> {
    try {
      const cachedUsers: CachedUser[] = users.map(user => ({
        ...user,
        cachedAt: Date.now(),
        syncStatus: 'synced' as const
      }))
      await db.users.bulkPut(cachedUsers)
    } catch (error) {
      console.error('IndexedDB saveUsers error:', error)
    }
  },

  /**
   * Delete user from cache
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await db.users.delete(id)
    } catch (error) {
      console.error('IndexedDB deleteUser error:', error)
    }
  },

  /**
   * Clear all cached users
   */
  async clearUsers(): Promise<void> {
    try {
      await db.users.clear()
    } catch (error) {
      console.error('IndexedDB clearUsers error:', error)
    }
  },

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
    try {
      await db.syncQueue.add(item as SyncQueueItem)
    } catch (error) {
      console.error('IndexedDB addToSyncQueue error:', error)
    }
  },

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    try {
      return await db.syncQueue.orderBy('createdAt').toArray()
    } catch (error) {
      console.error('IndexedDB getPendingSyncItems error:', error)
      return []
    }
  },

  /**
   * Remove sync queue item
   */
  async removeSyncQueueItem(id: number): Promise<void> {
    try {
      await db.syncQueue.delete(id)
    } catch (error) {
      console.error('IndexedDB removeSyncQueueItem error:', error)
    }
  },

  /**
   * Update sync queue item retry count
   */
  async updateSyncQueueRetry(id: number, error: string): Promise<void> {
    try {
      const item = await db.syncQueue.get(id)
      if (item) {
        await db.syncQueue.update(id, {
          retryCount: item.retryCount + 1,
          lastError: error
        })
      }
    } catch (error) {
      console.error('IndexedDB updateSyncQueueRetry error:', error)
    }
  },

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    try {
      await db.syncQueue.clear()
    } catch (error) {
      console.error('IndexedDB clearSyncQueue error:', error)
    }
  },

  /**
   * Get metadata value
   */
  async getMetadata(key: string): Promise<string | undefined> {
    try {
      const entry = await db.metadata.get(key)
      return entry?.value
    } catch (error) {
      console.error('IndexedDB getMetadata error:', error)
      return undefined
    }
  },

  /**
   * Set metadata value
   */
  async setMetadata(key: string, value: string): Promise<void> {
    try {
      await db.metadata.put({
        key,
        value,
        updatedAt: Date.now()
      })
    } catch (error) {
      console.error('IndexedDB setMetadata error:', error)
    }
  },

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        db.users.clear(),
        db.syncQueue.clear(),
        db.metadata.clear()
      ])
    } catch (error) {
      console.error('IndexedDB clearAll error:', error)
    }
  }
}

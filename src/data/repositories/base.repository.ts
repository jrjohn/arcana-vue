/**
 * Base Repository Interface
 * Generic contract for all repositories in the data layer
 *
 * @template TEntity - The domain entity type
 * @template TListResult - The paginated list result type
 * @template TCreateInput - Input type for create operations
 * @template TUpdateInput - Input type for update operations
 * @template TCreated - Return type for create operations
 * @template TUpdated - Return type for update operations
 */
export interface IRepository<
  TEntity,
  TListResult,
  TCreateInput,
  TUpdateInput,
  TCreated,
  TUpdated
> {
  /**
   * Get paginated list of entities
   * @param page - Page number (1-indexed)
   */
  getList(page?: number): Promise<TListResult>

  /**
   * Get single entity by ID
   * @param id - Entity identifier
   */
  getById(id: number): Promise<TEntity>

  /**
   * Create a new entity
   * @param input - Creation input data
   */
  create(input: TCreateInput): Promise<TCreated>

  /**
   * Update an existing entity
   * @param id - Entity identifier
   * @param input - Update input data
   */
  update(id: number, input: TUpdateInput): Promise<TUpdated>

  /**
   * Delete an entity
   * @param id - Entity identifier
   */
  delete(id: number): Promise<void>

  /**
   * Invalidate list caches
   */
  invalidateCache(): void

  /**
   * Clear all caches for this repository
   */
  clearCache(): Promise<void>
}

/**
 * Cache configuration for repositories
 */
export interface CacheConfig {
  /** Memory cache max items */
  memorySize: number
  /** LRU cache max items */
  lruSize: number
  /** LRU cache TTL in milliseconds */
  lruTtl: number
  /** Enable IndexedDB persistence */
  enablePersistence: boolean
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  memorySize: 50,
  lruSize: 100,
  lruTtl: 5 * 60 * 1000, // 5 minutes
  enablePersistence: true
}

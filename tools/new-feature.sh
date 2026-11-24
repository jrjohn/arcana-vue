#!/usr/bin/env bash
# Add one vertical feature slice shaped exactly like the User feature (AGENTS.md §1, §2).
#
#   tools/new-feature.sh Invoice
#   tools/new-feature.sh PurchaseOrder
#
# Generates, for <Name> (kebab <name>, plural <names>):
#   src/domain/entities/<name>.entity.ts           entity, list result, create input
#   src/domain/validators/<name>.validator.ts      field + input validation
#   src/domain/services/<name>.service.ts          use<Name>Service() + <name>Service singleton
#   src/data/dtos/<name>.dto.ts                    snake_case API shapes
#   src/data/mappers/<name>.mapper.ts              DTO <-> entity
#   src/data/repositories/<name>.repository.ts     I<Name>Repository (canonical interface)
#   src/repository/<name>.repository.ts            re-export of the interface
#   src/repository/impl/<name>.repository.impl.ts  <Name>RepositoryImpl (memory + LRU cache, DAO)
#   src/dao/<name>.dao.ts + impl/<name>.dao.impl.ts I<Name>Dao + <Name>DaoImpl (HTTP via IApiService)
#   src/presentation/view-models/<name>-list.view-model.ts   models / outputs / inputs / effects
#   src/presentation/features/<names>/<Name>ListPage.vue     view: renders outputs, calls inputs
#   tests/... one spec per layer, mirroring the User specs
# and registers it at the "@new-feature:" markers in src/core/di/{tokens,types,container,
# decorators,index}.ts, src/presentation/view-models/index.ts and src/router/index.ts.
# A missing marker or an existing file aborts BEFORE anything is written.
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: $0 <PascalCaseName>   e.g. $0 Invoice" >&2; exit 1; }
N="$1"
[[ "$N" =~ ^[A-Z][a-z0-9]+([A-Z][a-z0-9]+)*$ ]] || { echo "name must be PascalCase (Invoice, PurchaseOrder)" >&2; exit 1; }
[ "$N" != "User" ] || { echo "User already exists — it is the worked example" >&2; exit 1; }
command -v perl >/dev/null || { echo "perl is required" >&2; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

c="$(printf '%s' "${N:0:1}" | tr 'A-Z' 'a-z')${N:1}"                                   # invoice / purchaseOrder
k="$(printf '%s' "$N" | perl -pe 's/(?<!^)([A-Z])/-$1/g' | tr 'A-Z' 'a-z')"              # invoice / purchase-order
plural() { perl -e '$_=shift; s/([^aeiou])y$/$1ies/ or s/(s|x|z|ch|sh)$/$1es/ or s/$/s/; print' "$1"; }
P="$(plural "$N")"; cp="$(plural "$c")"; kp="$(plural "$k")"

# ---- Preflight: every anchor present exactly once, no target file exists.
ANCHORS=(
  "src/core/di/tokens.ts|@new-feature:tokens"
  "src/core/di/types.ts|@new-feature:types"
  "src/core/di/container.ts|@new-feature:imports"
  "src/core/di/container.ts|@new-feature:bind"
  "src/core/di/container.ts|@new-feature:rebind"
  "src/core/di/decorators.ts|@new-feature:imports"
  "src/core/di/decorators.ts|@new-feature:composables"
  "src/core/di/index.ts|@new-feature:exports"
  "src/presentation/view-models/index.ts|@new-feature:view-models"
  "src/router/index.ts|@new-feature:routes"
  "src/router/index.ts|@new-feature:nav"
)
for a in "${ANCHORS[@]}"; do
  f="${a%%|*}"; m="${a#*|}"
  [ -f "$f" ] || { echo "new-feature: $f missing — cannot register the slice (nothing written)" >&2; exit 1; }
  n="$(grep -c -- "$m" "$f" || true)"
  [ "$n" = 1 ] || { echo "new-feature: anchor '$m' found $n times in $f (need exactly 1) — restore it; nothing written" >&2; exit 1; }
done
FILES=(
  "src/domain/entities/$k.entity.ts" "src/domain/validators/$k.validator.ts" "src/domain/services/$k.service.ts"
  "src/data/dtos/$k.dto.ts" "src/data/mappers/$k.mapper.ts" "src/data/repositories/$k.repository.ts"
  "src/repository/$k.repository.ts" "src/repository/impl/$k.repository.impl.ts"
  "src/dao/$k.dao.ts" "src/dao/impl/$k.dao.impl.ts"
  "src/presentation/view-models/$k-list.view-model.ts" "src/presentation/features/$kp/${N}ListPage.vue"
  "tests/data/mappers/$k.mapper.spec.ts" "tests/dao/$k.dao.spec.ts" "tests/data/repositories/$k.repository.spec.ts"
  "tests/domain/validators/$k.validator.spec.ts" "tests/domain/services/$k.service.spec.ts"
  "tests/presentation/view-models/$k-list.view-model.spec.ts" "tests/presentation/features/$kp/${N}ListPage.spec.ts"
)
for f in "${FILES[@]}"; do [ ! -e "$f" ] || { echo "new-feature: $f already exists — nothing written" >&2; exit 1; }; done
grep -q "${N}Service: Symbol.for" src/core/di/tokens.ts && { echo "new-feature: TOKENS.${N}Service already registered" >&2; exit 1; }

# insert TEXT on the line(s) before the marker line (keeps the marker for the next feature)
insert() { # file marker text
  MARK="$2" TEXT="$3" perl -0pi -e 's/^([ \t]*[^\n]*\Q$ENV{MARK}\E)/$ENV{TEXT}\n$1/m or die "anchor $ENV{MARK} vanished\n"' "$1"
}
w() { mkdir -p "$(dirname "$1")"; cat > "$1"; }

# =========================================================================== domain
w "src/domain/entities/$k.entity.ts" <<EOF
/**
 * ${N} entity — domain model, independent of the API shape (see data/dtos/$k.dto.ts).
 */
export interface ${N} {
  id: number
  name: string
  createdAt: string
}

/** Paginated ${N} list */
export interface ${N}ListResult {
  items: ${N}[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

/** Input for creating a ${N} */
export interface Create${N}Input {
  name: string
}
EOF

w "src/domain/validators/$k.validator.ts" <<EOF
import type { Create${N}Input } from '@/domain/entities/$k.entity'
import type { ValidationResult } from '@/core/di/types'

/**
 * ${N} validator — pure input rules, used by the service before any I/O.
 */
export const ${c}Validator = {
  validateName(name: string): { isValid: boolean; error?: string } {
    const trimmed = name?.trim() ?? ''
    if (!trimmed) return { isValid: false, error: 'Name is required' }
    if (trimmed.length > 100) return { isValid: false, error: 'Name must be at most 100 characters' }
    return { isValid: true }
  },

  validateCreateInput(input: Create${N}Input): ValidationResult {
    const name = this.validateName(input.name)
    return {
      isValid: name.isValid,
      errors: name.error ? [name.error] : [],
      errorKeys: name.error ? ['${c}.form.nameInvalid'] : []
    }
  }
}
EOF

w "src/domain/services/$k.service.ts" <<EOF
import { ref, computed } from 'vue'
import type { ${N}, ${N}ListResult, Create${N}Input } from '@/domain/entities/$k.entity'
import type { ValidationResult } from '@/core/di/types'
import { ${c}Validator } from '@/domain/validators/$k.validator'
import type { I${N}Repository } from '@/repository/$k.repository'
// Circular at module level (container -> service -> decorators -> container) but safe:
// use${N}Repository() is only CALLED inside methods, after the container is built.
import { use${N}Repository } from '@/core/di/decorators'

function getRepository(): I${N}Repository {
  return use${N}Repository()
}

/**
 * ${N} service — business rules. Talks to I${N}Repository only (resolved through DI);
 * never to the DAO, the API or a cache.
 */
export function use${N}Service() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function run<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
    isLoading.value = true
    error.value = null
    try {
      return await fn()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(fallback)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  function validateCreateInput(input: Create${N}Input): ValidationResult {
    return ${c}Validator.validateCreateInput(input)
  }

  async function get${P}(page: number = 1): Promise<${N}ListResult> {
    return run(() => getRepository().get${P}(page), 'Failed to fetch ${cp}')
  }

  async function get${N}ById(id: number): Promise<${N}> {
    return run(() => getRepository().get${N}ById(id), 'Failed to fetch ${c}')
  }

  async function create${N}(input: Create${N}Input): Promise<${N}> {
    const validation = validateCreateInput(input)
    if (!validation.isValid) throw new Error(validation.errors.join(', '))
    return run(() => getRepository().create${N}(input), 'Failed to create ${c}')
  }

  async function delete${N}(id: number): Promise<void> {
    return run(() => getRepository().delete${N}(id), 'Failed to delete ${c}')
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    get${P},
    get${N}ById,
    create${N},
    delete${N},
    validateCreateInput
  }
}

export const ${c}Service = use${N}Service()
EOF

# =========================================================================== data
w "src/data/dtos/$k.dto.ts" <<EOF
/**
 * ${N} DTOs — the API's snake_case shapes. Only the DAO and the mapper see these.
 */
export interface ${N}Dto {
  id: number
  name: string
  created_at: string
}

export interface ${P}ListResponseDto {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: ${N}Dto[]
}

export interface ${N}ResponseDto {
  data: ${N}Dto
}

export interface Create${N}RequestDto {
  name: string
}
EOF

w "src/data/mappers/$k.mapper.ts" <<EOF
import type { ${N}, ${N}ListResult, Create${N}Input } from '@/domain/entities/$k.entity'
import type { ${N}Dto, ${P}ListResponseDto, Create${N}RequestDto } from '@/data/dtos/$k.dto'

/**
 * ${N} mapper — DTO (snake_case) <-> entity (camelCase).
 */
export const ${c}Mapper = {
  toEntity(dto: ${N}Dto): ${N} {
    return { id: dto.id, name: dto.name, createdAt: dto.created_at }
  },

  toDto(entity: ${N}): ${N}Dto {
    return { id: entity.id, name: entity.name, created_at: entity.createdAt }
  },

  toListResult(dto: ${P}ListResponseDto): ${N}ListResult {
    return {
      items: dto.data.map(d => this.toEntity(d)),
      page: dto.page,
      perPage: dto.per_page,
      total: dto.total,
      totalPages: dto.total_pages
    }
  },

  toCreateRequest(input: Create${N}Input): Create${N}RequestDto {
    return { name: input.name.trim() }
  }
}
EOF

w "src/data/repositories/$k.repository.ts" <<EOF
import type { ${N}, ${N}ListResult, Create${N}Input } from '@/domain/entities/$k.entity'

/**
 * I${N}Repository — contract for ${N} data. Implemented by
 * src/repository/impl/$k.repository.impl.ts and bound in src/core/di/container.ts.
 */
export interface I${N}Repository {
  get${P}(page?: number): Promise<${N}ListResult>
  get${N}ById(id: number): Promise<${N}>
  create${N}(input: Create${N}Input): Promise<${N}>
  delete${N}(id: number): Promise<void>
  invalidateListCache(): void
}
EOF

w "src/repository/$k.repository.ts" <<EOF
/**
 * I${N}Repository — re-exported from the canonical src/data/repositories/$k.repository.ts.
 */
export type { I${N}Repository } from '@/data/repositories/$k.repository'
EOF

w "src/repository/impl/$k.repository.impl.ts" <<EOF
import { memoryCache } from '@/data/cache/memory-cache.service'
import { lruCache } from '@/data/cache/lru-cache.service'
import { ${c}Mapper } from '@/data/mappers/$k.mapper'
import type { ${N}, ${N}ListResult, Create${N}Input } from '@/domain/entities/$k.entity'
import type { I${N}Repository } from '@/data/repositories/$k.repository'
import type { I${N}Dao } from '@/dao/$k.dao'

const CACHE_KEYS = {
  list: (page: number) => \`${kp}:list:\${page}\`,
  item: (id: number) => \`${kp}:\${id}\`
}

/**
 * ${N}RepositoryImpl — memory cache -> LRU cache -> DAO, the same read path as
 * UserRepositoryImpl. (Offline IndexedDB persistence needs a Dexie table for ${N};
 * add one to src/data/cache/indexed-db.service.ts if the feature must work offline.)
 */
export class ${N}RepositoryImpl implements I${N}Repository {
  constructor(private readonly dao: I${N}Dao) {}

  async get${P}(page: number = 1): Promise<${N}ListResult> {
    const key = CACHE_KEYS.list(page)
    const mem = memoryCache.general.get(key) as ${N}ListResult | undefined
    if (mem) return mem
    const lru = lruCache.general.get(key) as ${N}ListResult | undefined
    if (lru) {
      memoryCache.general.set(key, lru)
      return lru
    }
    const result = ${c}Mapper.toListResult(await this.dao.fetch${P}(page))
    memoryCache.general.set(key, result)
    lruCache.general.set(key, result)
    return result
  }

  async get${N}ById(id: number): Promise<${N}> {
    const key = CACHE_KEYS.item(id)
    const mem = memoryCache.general.get(key) as ${N} | undefined
    if (mem) return mem
    const lru = lruCache.general.get(key) as ${N} | undefined
    if (lru) {
      memoryCache.general.set(key, lru)
      return lru
    }
    const entity = ${c}Mapper.toEntity((await this.dao.fetch${N}ById(id)).data)
    memoryCache.general.set(key, entity)
    lruCache.general.set(key, entity)
    return entity
  }

  async create${N}(input: Create${N}Input): Promise<${N}> {
    const created = ${c}Mapper.toEntity((await this.dao.create${N}(${c}Mapper.toCreateRequest(input))).data)
    this.invalidateListCache()
    return created
  }

  async delete${N}(id: number): Promise<void> {
    await this.dao.delete${N}(id)
    memoryCache.general.delete(CACHE_KEYS.item(id))
    lruCache.general.delete(CACHE_KEYS.item(id))
    this.invalidateListCache()
  }

  invalidateListCache(): void {
    for (const key of memoryCache.general.keys()) {
      if (key.startsWith('${kp}:list:')) memoryCache.general.delete(key)
    }
    lruCache.general.deletePattern(/^${kp}:list:/)
  }
}
EOF

w "src/dao/$k.dao.ts" <<EOF
import type { ${P}ListResponseDto, ${N}ResponseDto, Create${N}RequestDto } from '@/data/dtos/$k.dto'

/**
 * I${N}Dao — HTTP access for ${N}. DTOs only: no entities, no cache, no rules.
 */
export interface I${N}Dao {
  fetch${P}(page: number): Promise<${P}ListResponseDto>
  fetch${N}ById(id: number): Promise<${N}ResponseDto>
  create${N}(data: Create${N}RequestDto): Promise<${N}ResponseDto>
  delete${N}(id: number): Promise<void>
}
EOF

w "src/dao/impl/$k.dao.impl.ts" <<EOF
import type { IApiService } from '@/core/di/types'
import type { ${P}ListResponseDto, ${N}ResponseDto, Create${N}RequestDto } from '@/data/dtos/$k.dto'
import type { I${N}Dao } from '@/dao/$k.dao'

/**
 * ${N}DaoImpl — the only class that knows the /${kp} endpoints.
 */
export class ${N}DaoImpl implements I${N}Dao {
  constructor(private readonly api: IApiService) {}

  async fetch${P}(page: number): Promise<${P}ListResponseDto> {
    return this.api.get<${P}ListResponseDto>(\`/${kp}?page=\${page}\`)
  }

  async fetch${N}ById(id: number): Promise<${N}ResponseDto> {
    return this.api.get<${N}ResponseDto>(\`/${kp}/\${id}\`)
  }

  async create${N}(data: Create${N}RequestDto): Promise<${N}ResponseDto> {
    return this.api.post<${N}ResponseDto>('/${kp}', data)
  }

  async delete${N}(id: number): Promise<void> {
    await this.api.delete(\`/${kp}/\${id}\`)
  }
}
EOF

# =========================================================================== presentation
w "src/presentation/view-models/$k-list.view-model.ts" <<EOF
/**
 * ${N}ListViewModel — MVVM Input/Output/Effect, same shape as useUserListViewModel.
 * View <-> models (v-model) ; outputs (read-only) -> view ; view -> inputs ; effects -> view
 */
import { type Ref, type ComputedRef } from 'vue'
import {
  createOutput,
  createState,
  createEffectEmitter,
  createLoadingState
} from './base.view-model'
import { ${c}Service } from '@/domain/services/$k.service'
import type { ${N} } from '@/domain/entities/$k.entity'

export type ${N}ListEffect =
  | { type: 'toast'; payload: { message: string; variant: 'success' | 'error' } }

export interface ${N}ListModels {
  newName: Ref<string>
}

export interface ${N}ListOutputs {
  items: Ref<${N}[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  isEmpty: ComputedRef<boolean>
  canCreate: ComputedRef<boolean>
}

export interface ${N}ListInputs {
  load${P}: (page?: number) => Promise<void>
  create${N}: () => Promise<void>
  delete${N}: (item: ${N}) => Promise<void>
  clearError: () => void
}

export function use${N}ListViewModel() {
  const items = createState<${N}[]>([])
  const newName = createState('')
  const loading = createLoadingState()
  const effects = createEffectEmitter<${N}ListEffect>()

  const isEmpty = createOutput(() => !loading.isLoading.value && items.value.length === 0)
  const canCreate = createOutput(() => newName.value.trim().length > 0 && !loading.isLoading.value)

  function fail(err: unknown, fallback: string): void {
    const message = err instanceof Error ? err.message : fallback
    loading.setError(message)
    effects.emit({ type: 'toast', payload: { message, variant: 'error' } })
  }

  async function load${P}(page: number = 1): Promise<void> {
    try {
      const result = await loading.withLoading(() => ${c}Service.get${P}(page))
      items.value = result.items
    } catch (err) {
      fail(err, 'Failed to load ${cp}')
    }
  }

  async function create${N}(): Promise<void> {
    if (!canCreate.value) return
    try {
      await loading.withLoading(() => ${c}Service.create${N}({ name: newName.value }))
      newName.value = ''
      effects.emit({ type: 'toast', payload: { message: '${N} created', variant: 'success' } })
      await load${P}()
    } catch (err) {
      fail(err, 'Failed to create ${c}')
    }
  }

  async function delete${N}(item: ${N}): Promise<void> {
    try {
      await loading.withLoading(() => ${c}Service.delete${N}(item.id))
      items.value = items.value.filter(i => i.id !== item.id)
      effects.emit({ type: 'toast', payload: { message: '${N} deleted', variant: 'success' } })
    } catch (err) {
      fail(err, 'Failed to delete ${c}')
    }
  }

  return {
    models: { newName } satisfies ${N}ListModels,
    outputs: {
      items,
      isLoading: loading.isLoading,
      error: loading.error,
      isEmpty,
      canCreate
    } satisfies ${N}ListOutputs,
    inputs: {
      load${P},
      create${N},
      delete${N},
      clearError: loading.clearError
    } satisfies ${N}ListInputs,
    effects
  }
}

export type ${N}ListViewModel = ReturnType<typeof use${N}ListViewModel>
EOF

w "src/presentation/features/$kp/${N}ListPage.vue" <<EOF
<script setup lang="ts">
/**
 * ${N}ListPage — view only: binds models, renders outputs, calls inputs, handles effects.
 * Never import a service, repository, DAO or the API here (AGENTS.md R3).
 */
import { onMounted, onUnmounted } from 'vue'
import { use${N}ListViewModel } from '@/presentation/view-models'
import LoadingSpinner from '@/presentation/components/shared/LoadingSpinner.vue'
import AlertMessage from '@/presentation/components/shared/AlertMessage.vue'

const vm = use${N}ListViewModel()
const { models, outputs, inputs } = vm

const unsubscribe = vm.effects.subscribe((effect) => {
  if (effect.type === 'toast') console.log(\`Toast: \${effect.payload.message} (\${effect.payload.variant})\`)
})

onMounted(() => inputs.load${P}())
onUnmounted(() => unsubscribe())
</script>

<template>
  <div class="container-fluid py-3">
    <h1 class="h3 mb-3">${P}</h1>

    <AlertMessage
      v-if="outputs.error.value"
      type="danger"
      :message="outputs.error.value"
      dismissible
      @dismiss="inputs.clearError"
    />

    <form class="d-flex gap-2 mb-3" @submit.prevent="inputs.create${N}()">
      <input
        v-model="models.newName.value"
        class="form-control"
        data-testid="${k}-name"
        placeholder="Name"
      />
      <button type="submit" class="btn btn-primary" data-testid="${k}-create" :disabled="!outputs.canCreate.value">
        Create
      </button>
    </form>

    <LoadingSpinner v-if="outputs.isLoading.value" />
    <p v-else-if="outputs.isEmpty.value" class="text-muted" data-testid="${k}-empty">No ${cp} yet.</p>
    <ul v-else class="list-group">
      <li
        v-for="item in outputs.items.value"
        :key="item.id"
        class="list-group-item d-flex justify-content-between align-items-center"
        data-testid="${k}-row"
      >
        {{ item.name }}
        <button type="button" class="btn btn-sm btn-outline-danger" @click="inputs.delete${N}(item)">Delete</button>
      </li>
    </ul>
  </div>
</template>
EOF

# =========================================================================== tests
w "tests/data/mappers/$k.mapper.spec.ts" <<EOF
import { describe, it, expect } from 'vitest'
import { ${c}Mapper } from '@/data/mappers/$k.mapper'

describe('${c}Mapper', () => {
  const dto = { id: 1, name: 'First', created_at: '2026-01-01T00:00:00Z' }

  it('maps DTO to entity and back', () => {
    const entity = ${c}Mapper.toEntity(dto)
    expect(entity).toEqual({ id: 1, name: 'First', createdAt: '2026-01-01T00:00:00Z' })
    expect(${c}Mapper.toDto(entity)).toEqual(dto)
  })

  it('maps a list response', () => {
    const result = ${c}Mapper.toListResult({ page: 2, per_page: 6, total: 7, total_pages: 2, data: [dto] })
    expect(result).toEqual({ items: [${c}Mapper.toEntity(dto)], page: 2, perPage: 6, total: 7, totalPages: 2 })
  })

  it('trims the create request', () => {
    expect(${c}Mapper.toCreateRequest({ name: '  x  ' })).toEqual({ name: 'x' })
  })
})
EOF

w "tests/dao/$k.dao.spec.ts" <<EOF
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ${N}DaoImpl } from '@/dao/impl/$k.dao.impl'
import type { IApiService } from '@/core/di/types'

describe('${N}DaoImpl', () => {
  let api: IApiService
  let dao: ${N}DaoImpl

  beforeEach(() => {
    api = {
      get: vi.fn().mockResolvedValue({ ok: true }),
      post: vi.fn().mockResolvedValue({ ok: true }),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      getClient: vi.fn()
    } as unknown as IApiService
    dao = new ${N}DaoImpl(api)
  })

  it('calls the ${kp} endpoints', async () => {
    await dao.fetch${P}(3)
    expect(api.get).toHaveBeenCalledWith('/${kp}?page=3')
    await dao.fetch${N}ById(7)
    expect(api.get).toHaveBeenCalledWith('/${kp}/7')
    await dao.create${N}({ name: 'n' })
    expect(api.post).toHaveBeenCalledWith('/${kp}', { name: 'n' })
    await dao.delete${N}(7)
    expect(api.delete).toHaveBeenCalledWith('/${kp}/7')
  })
})
EOF

w "tests/data/repositories/$k.repository.spec.ts" <<EOF
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ${N}RepositoryImpl } from '@/repository/impl/$k.repository.impl'
import type { I${N}Dao } from '@/dao/$k.dao'
import { memoryCache } from '@/data/cache/memory-cache.service'
import { lruCache } from '@/data/cache/lru-cache.service'

describe('${N}RepositoryImpl', () => {
  const dto = { id: 1, name: 'First', created_at: '2026-01-01T00:00:00Z' }
  let dao: I${N}Dao
  let repo: ${N}RepositoryImpl

  beforeEach(() => {
    memoryCache.general.clear()
    lruCache.general.clear()
    dao = {
      fetch${P}: vi.fn().mockResolvedValue({ page: 1, per_page: 6, total: 1, total_pages: 1, data: [dto] }),
      fetch${N}ById: vi.fn().mockResolvedValue({ data: dto }),
      create${N}: vi.fn().mockResolvedValue({ data: { ...dto, id: 2 } }),
      delete${N}: vi.fn().mockResolvedValue(undefined)
    }
    repo = new ${N}RepositoryImpl(dao)
  })

  it('fetches a page once, then serves it from the memory cache', async () => {
    const first = await repo.get${P}(1)
    const second = await repo.get${P}(1)
    expect(first.items[0].name).toBe('First')
    expect(second).toBe(first)
    expect(dao.fetch${P}).toHaveBeenCalledTimes(1)
  })

  it('falls back to the LRU cache when the memory cache is cold', async () => {
    await repo.get${P}(1)
    memoryCache.general.clear()
    await repo.get${P}(1)
    expect(dao.fetch${P}).toHaveBeenCalledTimes(1)
  })

  it('caches single items in memory and LRU', async () => {
    const a = await repo.get${N}ById(1)
    expect(await repo.get${N}ById(1)).toBe(a)
    memoryCache.general.clear()
    expect(await repo.get${N}ById(1)).toEqual(a)
    expect(dao.fetch${N}ById).toHaveBeenCalledTimes(1)
  })

  it('create invalidates the list cache', async () => {
    await repo.get${P}(1)
    const created = await repo.create${N}({ name: ' Second ' })
    expect(created.id).toBe(2)
    expect(dao.create${N}).toHaveBeenCalledWith({ name: 'Second' })
    await repo.get${P}(1)
    expect(dao.fetch${P}).toHaveBeenCalledTimes(2)
  })

  it('delete evicts the item and the list', async () => {
    await repo.get${N}ById(1)
    await repo.get${P}(1)
    await repo.delete${N}(1)
    expect(dao.delete${N}).toHaveBeenCalledWith(1)
    await repo.get${N}ById(1)
    await repo.get${P}(1)
    expect(dao.fetch${N}ById).toHaveBeenCalledTimes(2)
    expect(dao.fetch${P}).toHaveBeenCalledTimes(2)
  })
})
EOF

w "tests/domain/validators/$k.validator.spec.ts" <<EOF
import { describe, it, expect } from 'vitest'
import { ${c}Validator } from '@/domain/validators/$k.validator'

describe('${c}Validator', () => {
  it('accepts a normal name', () => {
    expect(${c}Validator.validateCreateInput({ name: 'ok' })).toEqual({ isValid: true, errors: [], errorKeys: [] })
  })

  it('rejects empty and too-long names', () => {
    expect(${c}Validator.validateCreateInput({ name: '   ' }).isValid).toBe(false)
    expect(${c}Validator.validateName('x'.repeat(101)).isValid).toBe(false)
  })
})
EOF

w "tests/domain/services/$k.service.spec.ts" <<EOF
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { use${N}Service } from '@/domain/services/$k.service'

// The service resolves its repository lazily via use${N}Repository() from the DI
// container, so mock that resolver (same approach as tests/domain/services/user.service.spec.ts).
const { repo } = vi.hoisted(() => ({
  repo: {
    get${P}: vi.fn(),
    get${N}ById: vi.fn(),
    create${N}: vi.fn(),
    delete${N}: vi.fn(),
    invalidateListCache: vi.fn()
  }
}))

vi.mock('@/core/di/decorators', () => ({
  use${N}Repository: () => repo
}))

describe('${N} service', () => {
  const item = { id: 1, name: 'First', createdAt: '2026-01-01T00:00:00Z' }

  beforeEach(() => {
    vi.clearAllMocks()
    repo.get${P}.mockResolvedValue({ items: [item], page: 1, perPage: 6, total: 1, totalPages: 1 })
    repo.get${N}ById.mockResolvedValue(item)
    repo.create${N}.mockResolvedValue(item)
    repo.delete${N}.mockResolvedValue(undefined)
  })

  it('delegates reads and writes to the repository', async () => {
    const service = use${N}Service()
    expect((await service.get${P}()).items).toEqual([item])
    expect(repo.get${P}).toHaveBeenCalledWith(1)
    expect(await service.get${N}ById(1)).toEqual(item)
    expect(await service.create${N}({ name: 'First' })).toEqual(item)
    await service.delete${N}(1)
    expect(repo.delete${N}).toHaveBeenCalledWith(1)
    expect(service.isLoading.value).toBe(false)
  })

  it('rejects invalid input before touching the repository', async () => {
    const service = use${N}Service()
    await expect(service.create${N}({ name: '' })).rejects.toThrow('Name is required')
    expect(repo.create${N}).not.toHaveBeenCalled()
  })

  it('exposes repository errors', async () => {
    repo.get${P}.mockRejectedValueOnce(new Error('boom'))
    repo.get${N}ById.mockRejectedValueOnce('not an error')
    const service = use${N}Service()
    await expect(service.get${P}()).rejects.toThrow('boom')
    expect(service.error.value?.message).toBe('boom')
    await expect(service.get${N}ById(1)).rejects.toThrow('Failed to fetch ${c}')
  })
})
EOF

w "tests/presentation/view-models/$k-list.view-model.spec.ts" <<EOF
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { use${N}ListViewModel } from '@/presentation/view-models/$k-list.view-model'
import { ${c}Service } from '@/domain/services/$k.service'

vi.mock('@/domain/services/$k.service', () => ({
  ${c}Service: {
    get${P}: vi.fn(),
    create${N}: vi.fn(),
    delete${N}: vi.fn()
  }
}))

describe('use${N}ListViewModel', () => {
  const item = { id: 1, name: 'First', createdAt: '2026-01-01T00:00:00Z' }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(${c}Service.get${P}).mockResolvedValue({ items: [item], page: 1, perPage: 6, total: 1, totalPages: 1 })
    vi.mocked(${c}Service.create${N}).mockResolvedValue(item)
    vi.mocked(${c}Service.delete${N}).mockResolvedValue(undefined)
  })

  it('loads ${cp} into outputs', async () => {
    const vm = use${N}ListViewModel()
    expect(vm.outputs.isEmpty.value).toBe(true)
    await vm.inputs.load${P}()
    expect(vm.outputs.items.value).toEqual([item])
    expect(vm.outputs.isEmpty.value).toBe(false)
  })

  it('creates only when a name is entered, then emits a toast and reloads', async () => {
    const vm = use${N}ListViewModel()
    const effects: unknown[] = []
    vm.effects.subscribe(e => effects.push(e))
    await vm.inputs.create${N}()
    expect(${c}Service.create${N}).not.toHaveBeenCalled()
    vm.models.newName.value = 'Second'
    expect(vm.outputs.canCreate.value).toBe(true)
    await vm.inputs.create${N}()
    expect(${c}Service.create${N}).toHaveBeenCalledWith({ name: 'Second' })
    expect(vm.models.newName.value).toBe('')
    expect(effects).toContainEqual({ type: 'toast', payload: { message: '${N} created', variant: 'success' } })
  })

  it('deletes an item', async () => {
    const vm = use${N}ListViewModel()
    await vm.inputs.load${P}()
    await vm.inputs.delete${N}(item)
    expect(vm.outputs.items.value).toEqual([])
  })

  it('surfaces errors as output + toast effect', async () => {
    vi.mocked(${c}Service.get${P}).mockRejectedValueOnce(new Error('boom'))
    vi.mocked(${c}Service.create${N}).mockRejectedValueOnce('x')
    vi.mocked(${c}Service.delete${N}).mockRejectedValueOnce(new Error('nope'))
    const vm = use${N}ListViewModel()
    const effects: unknown[] = []
    vm.effects.subscribe(e => effects.push(e))
    await vm.inputs.load${P}()
    expect(vm.outputs.error.value).toBe('boom')
    vm.models.newName.value = 'x'
    await vm.inputs.create${N}()
    expect(vm.outputs.error.value).toBe('Failed to create ${c}')
    await vm.inputs.delete${N}(item)
    expect(vm.outputs.error.value).toBe('nope')
    vm.inputs.clearError()
    expect(vm.outputs.error.value).toBeNull()
    expect(effects).toHaveLength(3)
  })
})
EOF

w "tests/presentation/features/$kp/${N}ListPage.spec.ts" <<EOF
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ${N}ListPage from '@/presentation/features/$kp/${N}ListPage.vue'
import { ${c}Service } from '@/domain/services/$k.service'

vi.mock('@/domain/services/$k.service', () => ({
  ${c}Service: {
    get${P}: vi.fn(),
    create${N}: vi.fn(),
    delete${N}: vi.fn()
  }
}))

describe('${N}ListPage', () => {
  const item = { id: 1, name: 'First', createdAt: '2026-01-01T00:00:00Z' }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(${c}Service.get${P}).mockResolvedValue({ items: [item], page: 1, perPage: 6, total: 1, totalPages: 1 })
    vi.mocked(${c}Service.create${N}).mockResolvedValue(item)
    vi.mocked(${c}Service.delete${N}).mockResolvedValue(undefined)
  })

  it('renders the rows loaded on mount', async () => {
    const wrapper = mount(${N}ListPage)
    await flushPromises()
    expect(wrapper.findAll('[data-testid="${k}-row"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('First')
    wrapper.unmount()
  })

  it('creates from the form and deletes from a row', async () => {
    const wrapper = mount(${N}ListPage)
    await flushPromises()
    await wrapper.find('[data-testid="${k}-name"]').setValue('Second')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(${c}Service.create${N}).toHaveBeenCalledWith({ name: 'Second' })
    await wrapper.find('[data-testid="${k}-row"] button').trigger('click')
    await flushPromises()
    expect(${c}Service.delete${N}).toHaveBeenCalledWith(1)
    wrapper.unmount()
  })

  it('shows the empty state', async () => {
    vi.mocked(${c}Service.get${P}).mockResolvedValue({ items: [], page: 1, perPage: 6, total: 0, totalPages: 0 })
    const wrapper = mount(${N}ListPage)
    await flushPromises()
    expect(wrapper.find('[data-testid="${k}-empty"]').exists()).toBe(true)
    wrapper.unmount()
  })
})
EOF

# =========================================================================== registration
insert src/core/di/tokens.ts '@new-feature:tokens' "  ${N}Dao: Symbol.for('${N}Dao'),
  ${N}Repository: Symbol.for('${N}Repository'),
  ${N}Service: Symbol.for('${N}Service'),"

insert src/core/di/types.ts '@new-feature:types' "/**
 * ${N} Service Interface
 */
export interface I${N}Service {
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  get${P}(page?: number): Promise<import('@/domain/entities/$k.entity').${N}ListResult>
  get${N}ById(id: number): Promise<import('@/domain/entities/$k.entity').${N}>
  create${N}(input: import('@/domain/entities/$k.entity').Create${N}Input): Promise<import('@/domain/entities/$k.entity').${N}>
  delete${N}(id: number): Promise<void>
  validateCreateInput(input: import('@/domain/entities/$k.entity').Create${N}Input): ValidationResult
}
export type { I${N}Repository } from '@/data/repositories/$k.repository'
export type { I${N}Dao } from '@/dao/$k.dao'
"

insert src/core/di/container.ts '@new-feature:imports' "import { ${N}DaoImpl } from '@/dao/impl/$k.dao.impl'
import { ${N}RepositoryImpl } from '@/repository/impl/$k.repository.impl'
import { ${c}Service } from '@/domain/services/$k.service'
import type { I${N}Dao, I${N}Repository, I${N}Service } from './types'"

insert src/core/di/container.ts '@new-feature:bind' "  // ${N}: DAO -> repository -> service
  const ${c}Dao = new ${N}DaoImpl(apiService)
  container.bind<I${N}Dao>(TOKENS.${N}Dao).toConstantValue(${c}Dao)
  container.bind<I${N}Repository>(TOKENS.${N}Repository).toConstantValue(new ${N}RepositoryImpl(${c}Dao))
  container.bind<I${N}Service>(TOKENS.${N}Service).toConstantValue(${c}Service)"

insert src/core/di/container.ts '@new-feature:rebind' "  const fresh${N}Dao = new ${N}DaoImpl(apiService)
  container.bind<I${N}Dao>(TOKENS.${N}Dao).toConstantValue(fresh${N}Dao)
  container.bind<I${N}Repository>(TOKENS.${N}Repository).toConstantValue(new ${N}RepositoryImpl(fresh${N}Dao))
  container.bind<I${N}Service>(TOKENS.${N}Service).toConstantValue(${c}Service)"

insert src/core/di/decorators.ts '@new-feature:imports' "import type { I${N}Dao, I${N}Repository, I${N}Service } from './types'"

insert src/core/di/decorators.ts '@new-feature:composables' "export function use${N}Dao(): I${N}Dao {
  return container.get<I${N}Dao>(TOKENS.${N}Dao)
}

export function use${N}Repository(): I${N}Repository {
  return container.get<I${N}Repository>(TOKENS.${N}Repository)
}

export function use${N}Service(): I${N}Service {
  return container.get<I${N}Service>(TOKENS.${N}Service)
}
"

insert src/core/di/index.ts '@new-feature:exports' "export type { I${N}Service, I${N}Repository, I${N}Dao } from './types'
export { use${N}Dao, use${N}Repository, use${N}Service } from './decorators'"

insert src/presentation/view-models/index.ts '@new-feature:view-models' "export * from './$k-list.view-model'"

insert src/router/index.ts '@new-feature:routes' "      {
        path: '${kp}',
        name: '${kp}',
        component: () => import('@/presentation/features/$kp/${N}ListPage.vue'),
        meta: { title: '${P}' }
      },"

insert src/router/index.ts '@new-feature:nav' "  ${cp}: {
    path: '/${kp}',
    toList: () => router.push('/${kp}')
  },"

echo "new-feature: ${N} slice created (${#FILES[@]} files + DI/router registration)."
echo "next: npx vitest run --coverage && npx vite build && tools/arch-check.sh"

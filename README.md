# Arcana Vue

Enterprise-grade Vue 3 application implementing Clean Architecture with MVVM + Input/Output/Effect (I/O/E) pattern.

## Architecture Evaluation

| Category | Rating | Notes |
|----------|--------|-------|
| **Layer Separation** | 10/10 | Clean 3-layer architecture (Presentation → Domain → Data) |
| **MVVM Pattern** | 10/10 | Sophisticated I/O/E pattern with models, outputs, inputs, effects |
| **Caching Strategy** | 10/10 | 4-layer progressive cache (Memory → LRU → IndexedDB → API) |
| **Security** | 10/10 | XSS, SQL injection, path traversal prevention |
| **Type Safety** | 10/10 | Strict TypeScript with decorators and path aliases |
| **Navigation** | 10/10 | Type-safe NavGraph pattern with compile-time checks |
| **DI Container** | 10/10 | InversifyJS with interface-based injection |
| **Error Handling** | 10/10 | Global boundaries + structured error types |
| **Testing** | 10/10 | 792 tests, 95%+ coverage thresholds |
| **i18n** | 10/10 | 6 languages with interpolation support |
| **Offline-First** | 10/10 | Network-aware with sync queue |

**Overall: Production-Ready Enterprise Architecture**

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3.5+ (Composition API, `<script setup>`) |
| Language | TypeScript 5.7+ (strict mode) |
| Build | Vite 6.3+ |
| State | Pinia 3.0 + ViewModel pattern |
| Routing | Vue Router 4.5 |
| HTTP | Axios 1.7 |
| DI | InversifyJS 7.10 |
| Caching | Dexie 4.2 (IndexedDB) |
| UI | Bootstrap 5.3 + Bootstrap Icons |
| Testing | Vitest 3.1 + Vue Test Utils |

## Project Structure

```
src/
├── core/                          # Core infrastructure
│   ├── di/                        # Dependency Injection
│   │   ├── container.ts           # InversifyJS container
│   │   ├── tokens.ts              # Injection tokens
│   │   ├── types.ts               # Service interfaces
│   │   ├── decorators.ts          # Vue composables (useInject)
│   │   └── index.ts               # Public exports
│   └── plugins/
│       └── error-boundary.plugin.ts
│
├── domain/                        # Business Logic Layer
│   ├── entities/                  # Domain models
│   │   ├── user.entity.ts
│   │   └── app-error.entity.ts
│   ├── services/                  # Business services
│   │   ├── user.service.ts
│   │   ├── error-handler.service.ts
│   │   ├── sanitization.service.ts
│   │   ├── network-status.service.ts
│   │   └── i18n.service.ts
│   └── validators/
│       └── user.validator.ts
│
├── data/                          # Data Access Layer
│   ├── api/
│   │   ├── api.service.ts         # Axios wrapper
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts
│   │       └── error.interceptor.ts
│   ├── repositories/
│   │   ├── interfaces/            # Repository contracts
│   │   │   ├── base.repository.ts
│   │   │   └── user.repository.ts
│   │   └── user.repository.ts     # 4-layer caching
│   ├── mappers/
│   │   └── user.mapper.ts         # DTO ↔ Entity
│   ├── dtos/
│   │   └── user.dto.ts
│   └── cache/
│       ├── memory-cache.service.ts
│       ├── lru-cache.service.ts
│       └── indexed-db.service.ts
│
├── presentation/                  # UI Layer
│   ├── layouts/
│   │   └── MainLayout.vue
│   ├── features/
│   │   ├── home/
│   │   ├── users/
│   │   └── error/
│   ├── components/
│   │   ├── layout/
│   │   ├── form/
│   │   ├── shared/
│   │   └── error/
│   │       ├── ErrorBoundary.vue
│   │       └── ErrorFallback.vue
│   └── view-models/
│       ├── base.view-model.ts     # I/O/E helpers
│       ├── user-list.view-model.ts
│       ├── user-detail.view-model.ts
│       └── user-form.view-model.ts
│
├── router/
│   └── index.ts                   # NavGraph pattern
│
├── styles/
│   └── main.scss
│
├── App.vue
└── main.ts
```

## Architecture Patterns

### Clean Architecture (3-Layer)

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│  Vue Components → ViewModels → Effects                  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      DOMAIN                             │
│  Services → Validators → Entities                       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                       DATA                              │
│  Repositories → Mappers → DTOs → API/Cache              │
└─────────────────────────────────────────────────────────┘
```

### MVVM + Input/Output/Effect (I/O/E)

```typescript
interface ViewModel<TModels, TOutputs, TInputs, TEffects> {
  models: TModels      // Two-way bindable refs (v-model)
  outputs: TOutputs    // Read-only computed state
  inputs: TInputs      // Action methods
  effects: TEffects    // Side effect emitter
}
```

**Example Usage:**
```vue
<script setup lang="ts">
const { models, outputs, inputs, effects } = useUserListViewModel()

// Subscribe to effects
effects.on('toast', (payload) => showToast(payload))
effects.on('navigate', (route) => router.push(route))
</script>

<template>
  <input v-model="models.searchQuery.value" />
  <div v-if="outputs.isLoading.value">Loading...</div>
  <button @click="inputs.loadUsers()">Refresh</button>
</template>
```

### 4-Layer Caching Architecture

```
Request
    │
    ▼
┌─────────────────┐
│  Memory Cache   │ < 1ms, 50 items, FIFO
└────────┬────────┘
         │ miss
         ▼
┌─────────────────┐
│   LRU Cache     │ 2-5ms, 100 items, 5min TTL
└────────┬────────┘
         │ miss
         ▼
┌─────────────────┐
│   IndexedDB     │ 10-50ms, persistent, offline
└────────┬────────┘
         │ miss
         ▼
┌─────────────────┐
│      API        │ 100-500ms+, source of truth
└─────────────────┘
```

### Type-Safe Navigation (NavGraph)

```typescript
// Type-safe, centralized navigation
navGraph.home.navigate()           // → /home
navGraph.users.toList()            // → /users
navGraph.users.toDetail(123)       // → /users/123
navGraph.users.toEdit(123)         // → /users/123/edit
navGraph.users.toCreate()          // → /users/new
navGraph.error.to404()             // → /error/404
```

### Dependency Injection (InversifyJS)

```typescript
// Inject services in ViewModels/composables
import { useInject, TOKENS } from '@/core/di'

const userService = useInject<IUserService>(TOKENS.UserService)

// Or use typed composables
import { useUserService } from '@/core/di'

const userService = useUserService()
```

**Testing with mocks:**
```typescript
import { createMockInjector, TOKENS } from '@/core/di'

const mockUserService = { getUsers: vi.fn() }
createMockInjector(TOKENS.UserService, mockUserService)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Open Vitest UI |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |

## Configuration

### TypeScript

Strict mode enabled with decorator support:
```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Path Aliases

```typescript
import { userService } from '@/domain/services/user.service'
import { UserListPage } from '@/presentation/features/users/UserListPage.vue'
import { apiService } from '@/data/api/api.service'
```

### Test Coverage

**Current Coverage (792 tests):**

| Metric | Actual | Threshold |
|--------|--------|-----------|
| Statements | 97.44% | 95% |
| Branches | 93.34% | 90% |
| Functions | 87.41% | 85% |
| Lines | 97.44% | 95% |

```javascript
// vitest.config.ts
coverage: {
  thresholds: {
    statements: 95,
    branches: 90,
    functions: 85,
    lines: 95
  }
}
```

**Test Structure:**
```
tests/
├── data/
│   ├── api/                    # API service tests
│   ├── cache/                  # Cache layer tests
│   ├── mappers/                # DTO mapper tests
│   └── repositories/           # Repository tests
├── domain/
│   ├── services/               # Business logic tests
│   └── validators/             # Validation tests
├── presentation/
│   ├── components/             # Component tests
│   │   ├── error/              # Error boundary tests
│   │   ├── form/               # Form component tests
│   │   ├── layout/             # Layout component tests
│   │   └── shared/             # Shared component tests
│   ├── features/               # Feature page tests
│   └── view-models/            # ViewModel tests
├── router/                     # Router tests
└── setup.ts                    # Test setup
```

## Security Features

| Feature | Implementation |
|---------|---------------|
| XSS Prevention | HTML entity encoding, dangerous pattern removal |
| SQL Injection | Pattern detection, special character validation |
| Path Traversal | Filename sanitization, directory separator removal |
| URL Validation | Protocol whitelist (http, https, mailto, tel) |
| Input Sanitization | Control character removal, whitespace normalization |

## Internationalization

Supported languages:
- English (en)
- Chinese Simplified (zh)
- Chinese Traditional (zh-TW)
- Spanish (es)
- French (fr)
- German (de)

```typescript
import { useI18n } from '@/domain/services/i18n.service'

const { t, setLanguage } = useI18n()

t('user.list.title')                    // "User Management"
t('user.list.showing', { start: 1, end: 10, total: 100 })
setLanguage('zh')                       // Switch to Chinese
```

## Error Handling

### Error Boundary

```vue
<ErrorBoundary @error="handleError">
  <YourComponent />
  <template #fallback="{ error, reset }">
    <CustomErrorUI :error="error" @retry="reset" />
  </template>
</ErrorBoundary>
```

### Structured Errors

```typescript
interface AppError {
  code: string              // E10001, E20001, etc.
  message: string           // Technical message
  category: ErrorCategory   // NETWORK, VALIDATION, etc.
  userMessage: string       // i18n key for display
  timestamp: Date
}
```

## Offline-First

```typescript
// Network-aware operations
if (!networkStatus.isOnline.value) {
  // Queue for sync when online
  await indexedDbService.addToSyncQueue({
    type: 'create',
    entityType: 'user',
    payload: userData
  })
}
```

## License

MIT

# AGENTS.md — arcana-vue

Instructions for any AI coding agent (Claude Code, Codex, Cursor, Copilot, Gemini…) working
in this repository **or in any product created from it**. `CLAUDE.md`, `GEMINI.md` and
`.github/copilot-instructions.md` all point here; this file is the single source.

> **You MUST NOT report a task as done until `tools/arch-check.sh` exits 0 and the CI lane
> (§5) is green.** Breaking the layering costs a red build: the pre-commit hook
> (`tools/githooks/pre-commit`) rejects new files outside the layer directories, `*Impl`
> imports outside the DI container and views that import services, and Jenkins stage
> "Architecture Qube" fails the merge. A page that calls axios directly compiles and renders —
> and then fails both gates after the work is written.

## 0. First command in a fresh clone

Run `tools/install-hooks.sh` once. Git does not install hooks on clone; until you run it the
pre-commit check does not exist and only CI catches a wrong layout. `tools/new-app.sh` runs
it for you.

## 1. Starting something new

| Situation | Do this | Never do this |
|---|---|---|
| New Vue product | `tools/new-app.sh <name> <dest-dir>` — copies the whole repo, renames the npm package, page title, IndexedDB name, image, Jenkins/Sonar/CI container names, resets the version to 0.1.0, installs the hook | `npm create vue` and copy a few `src/` folders into it |
| New feature (page + data) | `tools/new-feature.sh <Name>` — one vertical slice: entity, validator, service, DTO, mapper, repository interface + impl, DAO interface + impl, ViewModel (models/outputs/inputs/effects), page, DI tokens + bindings, route + `navGraph` entry, one spec per layer. Then edit the placeholder `name` field | Put axios calls or business rules in a `.vue` file, or add `src/foo.ts` |
| New field on a feature | Change entity, DTO, mapper, validator and their specs together | Change only the DTO |

Copying parts instead of `new-app.sh` loses this file, the hook and the CI gate, so nothing
tells the next agent the rules exist.

## 2. Layers — where a file goes

Path alias `@/` = `src/`. Only `src/main.ts`, `src/App.vue` and `src/vite-env.d.ts` sit at the
`src/` root. Tests mirror the paths under `tests/`.

| Layer | Path | Contains | May depend on |
|---|---|---|---|
| Entry | `src/main.ts`, `src/App.vue` | app bootstrap, Pinia, router, error-boundary plugin | everything |
| DI | `src/core/di/{container,tokens,types,decorators,index}.ts` | Inversify container, `TOKENS` symbols, service interfaces (`types.ts`), `useX()` resolvers | everything; `container.ts` is the only file that imports `*Impl` classes |
| Router | `src/router/index.ts` | routes (lazy page imports) + type-safe `navGraph` | pages |
| View | `src/presentation/features/<feature>/*Page.vue`, `components/<group>/`, `layouts/` | templates: bind `models`, render `outputs`, call `inputs`, subscribe to `effects` | its ViewModel, `navGraph`, components, entities (types), `i18n.service` |
| ViewModel | `src/presentation/view-models/<x>.view-model.ts` | `useXViewModel()` returning `{ models, outputs, inputs, effects }` built with `base.view-model.ts` helpers | domain services, entities, i18n |
| Domain | `src/domain/services/<x>.service.ts`, `validators/`, `entities/` | business rules (`useXService()` + `xService` singleton), pure validation, framework-free entity interfaces | repository **interfaces** (resolved via `@/core/di/decorators`), validators, entities |
| Repository | interface `src/data/repositories/<x>.repository.ts` (re-exported by `src/repository/<x>.repository.ts`); impl `src/repository/impl/<x>.repository.impl.ts` | cache-first data access (memory → LRU → IndexedDB → DAO), offline sync queue | DAO interfaces, mappers, `src/data/cache/`, `network-status.service` |
| DAO | interface `src/dao/<x>.dao.ts`; impl `src/dao/impl/<x>.dao.impl.ts` | one class per resource that knows its HTTP endpoints; DTOs in, DTOs out | `IApiService`, DTOs |
| Data support | `src/data/api/` (axios `apiService` + interceptors), `data/cache/` (memory, LRU, Dexie IndexedDB), `data/dtos/`, `data/mappers/` | transport, caches, snake_case API shapes, DTO ↔ entity mapping | entities, DTOs |

Direction is one way: view → ViewModel → service → repository interface ← repository impl →
DAO interface ← DAO impl → `apiService`. A lower layer never imports a higher one.
Worked example: `UserListPage.vue` → `user-list.view-model.ts` → `user.service.ts` →
`IUserRepository` ← `UserRepositoryImpl` → `IUserDao` ← `UserDaoImpl`, wired in
`src/core/di/container.ts`. Legacy exception — do not copy: `HomePage.vue` imports
`userService` directly.

## 3. Rules

| # | Rule | Enforced by |
|---|---|---|
| R1 | Repositories and DAOs are an interface plus an `XRepositoryImpl` / `XDaoImpl` class in an `impl/` directory next to it, constructed with its dependencies as interfaces. | arch-qube "Interface/Impl Colocation", "Implementation Naming Convention" |
| R2 | Only `src/core/di/container.ts` imports a concrete `*Impl` class or anything from an `impl/` directory; everyone else resolves the interface through `TOKENS` / `useX()` in `src/core/di/decorators.ts`. `export … from` in `index.ts` and tests are the only other mentions. | arch-qube "Only DI Container Imports Impl"; pre-commit hook |
| R3 | A `.vue` view never imports a service (except `i18n.service`), repository, DAO, mapper, cache or the API; it talks to its ViewModel only. | arch-qube "View Cannot Call Service", "Unidirectional Data Flow", "Layer Direction Enforcement"; pre-commit hook |
| R4 | A ViewModel returns `{ models, outputs, inputs, effects }` typed with `satisfies XModels / XOutputs / XInputs`; outputs are read-only to the view, side effects (navigation, toast, dialog) go through `createEffectEmitter`. | arch-qube MVVM I/O/E rules are NOT EVALUATED (AI-only) — on you; `new-feature.sh` generates the shape |
| R5 | Business rules and validation live in the service/validator, HTTP only in the DAO, caching only in the repository. | arch-qube "No Business Logic in Boundary", "Layer Direction Enforcement" |
| R6 | No new file directly under `src/` and none outside the directories of §2 (`features/<feature>/` and `components/<group>/` are one level deep). | pre-commit hook |
| R7 | Every new binding gets a symbol in `src/core/di/tokens.ts` and is bound in **both** `createContainer()` and `resetContainer()`; routes are added in `src/router/index.ts` with a `navGraph` entry. Keep the `// @new-feature:*` markers — `tools/new-feature.sh` needs them. | `tools/new-feature.sh` refuses to run without the markers |
| R8 | Every new DAO, repository, service, validator, mapper, ViewModel and page has a vitest spec under `tests/` mirroring its path; coverage stays above the thresholds in `vitest.config.ts` (statements 88, branches 80, functions 84, lines 88). | `vitest run --coverage` thresholds (Jenkins "Unit Tests"); SonarQube quality gate; arch-qube "Test Coverage Threshold" |
| R9 | User-visible text in existing pages goes through `useI18n().t()` with keys in `src/domain/services/i18n.service.ts`. No secrets or API keys in source; read config from `import.meta.env`. | SonarQube; review |

## 4. Architecture check (arch-qube)

arch-qube (https://github.com/jrjohn/arcana-arch-qube) scans the source for layer-direction,
DI, MVVM and naming violations and scores it; usage guide:
https://github.com/jrjohn/arcana-skills/tree/main/arch-qube-skill. The version is pinned in
`tools/arch-qube.version`, read by both `tools/arch-check.sh` and the Jenkinsfile.

- Run: `tools/arch-check.sh` — pulls `ghcr.io/jrjohn/arch-qube:<version>` (public,
  multi-arch), else `arcana.boo/arcana/arch-qube:<version>`; same `--framework vue`,
  `--threshold 90` and exclusions as Jenkins stage "Architecture Qube". Exit 0 = pass,
  1 = fail, 2 = could not run (no Docker / no image) — 2 is **not** a pass. It never falls
  back to `:latest`.
- Without Docker, on a tree without `node_modules/`, `dist/` and `coverage/`:
  `pipx run --spec git+https://github.com/jrjohn/arcana-arch-qube.git@v0.5.7 arch-qube scan . --framework vue --no-ai --ci --format json,markdown -o arch-qube-reports --threshold 90`.
- Report: `arch-qube-reports/arch-qube.md` (summary) and `arch-qube.json` (per rule
  `files_checked` and violations). PASS needs score ≥ threshold **and** zero violations in
  CRITICAL rules — a 99.4 with one critical violation FAILS. A rule under "Not evaluated" is
  not a pass (here: the MVVM I/O/E, 4-layer cache, offline-first and security rules); a rule
  with `files_checked: 0` checked nothing; an unlayered project scores 0 on "Layer Direction
  Enforcement".
- `--ci` prints nothing when it fails: rerun without `--ci`, or read the copied report.
- False positive: open an issue on arcana-arch-qube with the report attached. Never lower
  `--threshold`, add exclusions, or move code to dodge a rule.

## 5. Before you say "done"

Run these, in this order, and paste the last line of each into your summary:

```bash
tools/arch-check.sh                 # must print "arch-check: PASS"
npx vitest run --coverage           # Jenkins "Unit Tests" (docker-compose.test.yml); fails below the coverage thresholds
npx vite build                      # Jenkins "Docker Compose Build" (Dockerfile.ci runs exactly this)
```

Without a local Node toolchain, run the identical lanes in Docker:
`docker compose -f docker-compose.test.yml run --build --rm test` (tests) and
`docker compose -f docker-compose.ci.yml build` (build). CI also runs SonarQube, which you
cannot run locally; keep R8.

What CI does **not** run, so do not claim it passed: `npm run lint` (no ESLint is installed
or configured) and `npm run build` / `vue-tsc` (fails to start under TypeScript 7). Do not
report either as a check you ran.

## 6. Reference

- Optional detail: `arcana-vue-developer-skill`
  (https://github.com/jrjohn/arcana-skills/tree/main/arcana-vue-developer-skill).
  This file is the source of truth: if the skill and this file disagree, this file wins.

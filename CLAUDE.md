# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

DeepCover generates test fixtures from every permutation of seed data you give it. It's an npm-workspaces monorepo, and the only package is `packages/deepcover` (published to npm under the `alpha` tag).

## Commands

Run these from the repo root:

- `npm -w ./packages/deepcover test`: vitest in watch mode. Type tests (`*.spec-d.ts`) run too, because `typecheck.enabled` is on.
- `npm -w ./packages/deepcover test -- --run <path-or-pattern>`: run a single test file or pattern once.
- `npm -w ./packages/deepcover run typecheck`: `tsc --noEmit`.
- `npm -w ./packages/deepcover run build`: `tsc -p tsconfig.build.json` builds `dist/`. Specs and fixtures are excluded, and `isolatedDeclarations` is on, so exported functions need explicit return types.
- `npm run lint`: ESLint with `--fix`.
- `npm start <file.ts>`: run a TS file through `@swc-node/register`. This is how you run the scratch files in `playground/`.

Vitest runs with `bail: 1`, one worker, and no file parallelism, so it stops at the first failure.

CI (`.github/workflows/main.yml`) builds and publishes on every push to `main`.

## Architecture

Code lives in `packages/deepcover/src/`. Imports always go through the `#src/*` alias, never relative paths. The public entry points are `permutation/exports.ts` (`deepcover`), `permutation/pure/exports.ts` (`deepcover/pure`), and `utils/exports.ts` (`deepcover/utils`).

**The core abstraction** is `PermutationGenerator` in `permutation/definitions.ts`. It is an `Iterable` of all permutations, and it also carries:
- `size` (a `bigint`), `type`, `structure` (`array | pojo | mixed | primitive`), `originalInputArg`, and `modifiers`.
- Path introspection: `permutationPaths`, `primitivePermutationPaths`, `extract(paths)`, `exclude(paths)`, and `generatorAt(path)`.
- Schema algebra: `merge` (path-wise schema merge), `outputMerge` (object merge applied to the generated outputs), `subSchemaOf`, and `union`.

**Primitives** live in `permutation/primitive/`. Each one is a factory that returns a plain object made with `Object.assign(Object.create(null), {...} satisfies X)`. They are not classes.
- `each(...values)`: a leaf with one permutation per value. Calling it with no arguments returns `never()`.
- `series(...generators)`: concatenates generators.
- `record(pojo | array)`: the cartesian product over keys or indices. Paths come from this primitive. `component()` is an identity helper for typing record inputs.
- `never()`: the empty generator. `seal()`: stops the input from being expanded further.

Every primitive has a `*.types.ts` file next to it. That file holds the heavy type-level computation of output types and paths. Much of the library's complexity is in these types. The README notes that VSCode's built-in TS SDK hits depth limits on them, so use the workspace `node_modules` TypeScript.

**Modifiers** live in `permutation/modifiers/`: `optional` and `clean`. A modifier wraps a generator and adds a string to `modifiers`. Modifiers must be idempotent, and only `record` respects them (for example, `optional` makes a key omittable). Use `checkPermutationType(v, type, structure?)` and `isOptional(v)` to tell generators apart.

**Higher-level operations**:
- `combo(gen, {max})`: a `series` of `extract`s over combinations of primitive paths, with conflicting sibling-index paths filtered out.
- `mutate(a, b)`: `a.outputMerge(combo(b))`, which yields before/after pairs.

**Pure iterable helpers** live in `permutation/pure/`: `permutations`, `combinations`, `explicitPermutations`, `cachedIterable`, `concat`, and `iterableWithIndex`. They know nothing about generators.

## Tests

Specs sit next to the source. The `*.fixture.ts` files (for example, `record.fixture.ts` and `each.fixture.ts`) generate input and expected-output cases programmatically. Specs loop over these cases and assert `size`, the set of outputs, `structure`, `modifiers`, and paths. When you add behavior, add it to the fixture generator rather than writing a one-off test. Type-level behavior is tested in `*.spec-d.ts`.

## Conventions

- Prettier: tabs (width 4), single quotes, trailing commas, print width 100.
- ESLint enforces `consistent-type-imports` and `consistent-type-exports`, `import/no-cycle`, and no `any`. Unused variables must be prefixed with `_`.
- The TS config is strict and also enables `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, and `erasableSyntaxOnly`, which means no enums and no namespaces.
- Comments: concise, only where the code doesn't tell the story (the why, non-obvious constraints). No restating what the code does.
- Session replies: concise, no explanatory filler.

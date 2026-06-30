# Implementation Plan: Provider-Neutral Identity

## Overview

This plan implements a provider-neutral identity layer by adding internal user tables, an auth abstraction with a Supabase adapter, updated middleware for user resolution, and a frontend auth module. Tasks are ordered so each step builds on the previous — starting with the data layer, then the auth service, middleware, frontend, migration, and testing.

## Tasks

- [ ] 1. Define database schema and generate migration
  - [ ] 1.1 Add `users` and `auth_identities` table definitions to the Drizzle schema
    - Add `usersTable` and `authIdentitiesTable` to `lib/db/src/schema/index.ts`
    - Include UUID primary keys, email unique constraint, status with default "active", timestamps
    - Add `authIdentitiesTable` with foreign key to `usersTable`, unique index on `(provider, provider_user_id)`
    - Export insert schemas, types, and the unique index
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ] 1.2 Generate Drizzle migration for the new tables
    - Run `drizzle-kit generate` to produce the SQL migration file in `lib/db/drizzle/`
    - Verify the migration creates both tables with correct constraints
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Implement AuthService interface and Supabase adapter
  - [ ] 2.1 Create the AuthService interface and AuthValidationError
    - Create `artifacts/api-server/src/lib/auth-service.ts`
    - Define `AuthResult` interface with `providerUserId`, `email`, `provider` fields
    - Define `AuthService` interface with `validateToken(token: string): Promise<AuthResult>`
    - Define `AuthValidationError` class extending `Error`
    - _Requirements: 2.1, 2.2, 2.5, 5.3_

  - [ ] 2.2 Create the Supabase auth adapter
    - Create `artifacts/api-server/src/lib/supabase-auth-adapter.ts`
    - Implement `SupabaseAuthAdapter` class that calls Supabase `/auth/v1/user` endpoint
    - Accept `supabaseUrl` and `serviceRoleKey` in constructor
    - Return `AuthResult` on success, throw `AuthValidationError` on failure
    - _Requirements: 2.4, 2.5_

  - [ ] 2.3 Create the auth factory function
    - Create `artifacts/api-server/src/lib/auth-factory.ts`
    - Read `AUTH_PROVIDER` env var (default "supabase")
    - Return `SupabaseAuthAdapter` instance for "supabase" provider
    - Throw descriptive error for unknown providers or missing env vars
    - _Requirements: 2.3, 5.4_

  - [ ]* 2.4 Write unit tests for AuthService components
    - Install `vitest` and configure in api-server package
    - Test auth factory returns correct adapter for "supabase"
    - Test auth factory throws for unknown provider
    - Test SupabaseAuthAdapter returns AuthResult on successful fetch
    - Test SupabaseAuthAdapter throws AuthValidationError on failed fetch
    - _Requirements: 2.3, 2.4, 2.5_

- [ ] 3. Checkpoint - Ensure data layer and auth service compile
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement updated auth middleware with user resolution
  - [ ] 4.1 Replace the auth middleware with provider-neutral implementation
    - Rewrite `artifacts/api-server/src/middlewares/auth.ts`
    - Add `RequestUser` interface and Express `Request` type augmentation
    - Use `createAuthService()` to get the auth service instance
    - Validate token via `authService.validateToken()`
    - Look up internal user via `auth_identities` table
    - Auto-provision new user + identity in a transaction on first login
    - Check user status — reject with 403 if "suspended" or "deactivated"
    - Attach `RequestUser` (`id`, `email`, `status`) to `req.user`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 1.4_

  - [ ]* 4.2 Write property test: Auto-provisioning creates linked records
    - Install `fast-check` in api-server
    - **Property 2: Auto-provisioning creates linked records**
    - Generate random AuthResult inputs (email, providerUserId, provider)
    - Mock DB layer to track insertions
    - Verify exactly one user and one auth_identity record created, linked by userId
    - **Validates: Requirements 1.4, 3.3**

  - [ ]* 4.3 Write property test: User resolution correctness
    - **Property 3: User resolution correctness**
    - Generate random existing user/identity pairs
    - Mock AuthService to return matching AuthResult
    - Verify req.user matches stored user data (id, email, status)
    - **Validates: Requirements 3.2, 3.4**

  - [ ]* 4.4 Write property test: Status-based access rejection
    - **Property 4: Status-based access rejection**
    - Generate random users with status in ["suspended", "deactivated"]
    - Verify middleware returns 403 and does not attach user to request
    - **Validates: Requirements 3.5**

  - [ ]* 4.5 Write property test: Multiple identities resolve to same user
    - **Property 5: Multiple identities resolve to same user**
    - Generate random users with multiple auth_identity records (different providers)
    - Resolve each identity, verify all yield the same internal user id
    - **Validates: Requirements 1.5**

- [ ] 5. Checkpoint - Ensure middleware compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement frontend auth module and integrate
  - [ ] 6.1 Create the frontend auth module
    - Create `artifacts/riisemap/src/lib/auth.ts`
    - Export `getAccessToken()`, `signIn()`, `signOut()`, `getSession()`, `onAuthStateChange()`
    - Use existing `supabase` client internally
    - Keep the API surface provider-agnostic (no Supabase types in return signatures beyond Session)
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ] 6.2 Update App.tsx to use the auth module
    - Import `getAccessToken`, `getSession`, `onAuthStateChange` from `@/lib/auth`
    - Replace direct `supabase.auth.getSession()` and `onAuthStateChange` calls
    - Wire `setAuthTokenGetter` to use `getAccessToken` from auth module
    - Remove direct `supabase` import from App.tsx
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 6.3 Update Login.tsx to use the auth module
    - Import `signIn` from `@/lib/auth`
    - Replace direct `supabase.auth.signInWithPassword` call with `signIn()`
    - _Requirements: 4.1, 4.3_

- [ ] 7. Create existing user seed/migration script
  - [ ] 7.1 Write idempotent seed script for existing user
    - Create a script in `lib/db/` that provisions `info@techsofcolor.org`
    - Query the Supabase user UUID from env var or configuration
    - Insert into `users` table (skip if email already exists)
    - Insert into `auth_identities` with provider="supabase" (skip if identity exists)
    - Make the script idempotent with existence checks
    - _Requirements: 1.4, 1.5_

- [ ] 8. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation language is TypeScript throughout (matching the existing monorepo)
- Property 1 (unique constraint) is enforced at the database level via the unique index and doesn't need a separate application-level property test

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "4.1", "6.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5", "6.2", "6.3"] },
    { "id": 5, "tasks": ["7.1"] }
  ]
}
```

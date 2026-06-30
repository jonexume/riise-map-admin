# Requirements Document

## Introduction

This feature establishes a provider-neutral identity layer for the RiiseMap Admin application, scoped for a competition MVP with limited time. The current system has no internal user model — identity exists solely in Supabase's `auth.users` table, and authentication logic is tightly coupled to Supabase APIs throughout the frontend and backend. This MVP introduces an internal `users` table, a linking `auth_identities` table, and a thin auth abstraction layer that uses Supabase today but can be swapped for AWS Cognito later with minimal rework. There is only one user type (admin) and no role-based access control — the goal is purely decoupling identity from the auth provider. The design prioritizes stability, simplicity, and fast iteration — minimal moving parts, easy to debug, easy to extend.

## Glossary

- **Auth_Provider**: An external authentication service (Supabase Auth today, AWS Cognito in future) responsible for credential verification, token issuance, and session management
- **Auth_Service**: The application-internal abstraction layer that mediates between the Auth_Provider and the rest of the application
- **Internal_User**: A record in the application's `users` table representing a unique identity within the system, independent of any Auth_Provider
- **Auth_Identity**: A record linking an Internal_User to a specific Auth_Provider account (e.g., a Supabase user UUID or a Cognito sub)
- **Token**: A JWT or opaque access token issued by the Auth_Provider, used to authenticate API requests
- **Provider_Adapter**: A concrete implementation of the Auth_Service interface for a specific Auth_Provider
- **Middleware**: Server-side request processing that validates tokens and resolves Internal_User identity before route handlers execute

## Requirements

### Requirement 1: Internal User Model

**User Story:** As a platform administrator, I want user identity stored in our own database, so that the application is not locked into a single authentication provider.

#### Acceptance Criteria

1. THE Application SHALL maintain a `users` table with columns: `id` (UUID, primary key), `email` (unique, not null), `display_name` (varchar, nullable), `status` (varchar, not null, default "active"), `created_at` (timestamp with timezone), and `updated_at` (timestamp with timezone)
2. THE Application SHALL maintain an `auth_identities` table with columns: `id` (UUID, primary key), `user_id` (foreign key to users), `provider` (varchar, e.g. "supabase" or "cognito"), `provider_user_id` (varchar, the external provider's user identifier), and `created_at` (timestamp with timezone)
3. THE `auth_identities` table SHALL enforce a unique constraint on the combination of `provider` and `provider_user_id`
4. WHEN a user authenticates and no Internal_User exists for that provider identity, THE Auth_Service SHALL create the Internal_User and Auth_Identity records in a single transaction
5. THE `auth_identities` table SHALL support multiple records per Internal_User to enable migration between providers

### Requirement 2: Auth Abstraction Layer (Server)

**User Story:** As a developer, I want authentication logic behind a simple provider-neutral interface, so that switching from Supabase to Cognito requires only a new adapter implementation.

#### Acceptance Criteria

1. THE Auth_Service SHALL define a TypeScript interface with a single method: `validateToken(token: string): Promise<AuthResult>`
2. THE `AuthResult` type SHALL contain: `providerUserId` (string), `email` (string), and `provider` (string literal)
3. THE Application SHALL instantiate the Auth_Service through a factory function that reads the `AUTH_PROVIDER` environment variable (defaulting to "supabase")
4. THE Supabase Provider_Adapter SHALL validate tokens by calling the Supabase `/auth/v1/user` endpoint using the service role key
5. IF token validation fails, THEN THE Provider_Adapter SHALL throw a standardized error that the Middleware can handle uniformly regardless of provider

### Requirement 3: Token Validation and User Resolution Middleware

**User Story:** As a developer, I want the auth middleware to resolve internal user IDs from provider tokens, so that route handlers work with application-level identity rather than provider-specific data.

#### Acceptance Criteria

1. WHEN a request arrives with a Bearer token, THE Middleware SHALL call `Auth_Service.validateToken()` to verify the token
2. WHEN token validation succeeds, THE Middleware SHALL look up the Internal_User by querying the `auth_identities` table using the `provider` and `provider_user_id`
3. IF no Internal_User exists for a valid token, THEN THE Middleware SHALL create the Internal_User and Auth_Identity records (first-login auto-provisioning)
4. WHEN user resolution succeeds, THE Middleware SHALL attach the Internal_User `id`, `email`, and `status` to the Express request object and MAY reject the request for additional validation reasons beyond token validity
5. IF the Internal_User has a `status` of "suspended" or "deactivated", THEN THE Middleware SHALL reject the request with a 403 status code

### Requirement 4: Frontend Auth Module

**User Story:** As a developer, I want Supabase client calls isolated into a single module, so that the rest of the frontend is provider-agnostic and easy to update.

#### Acceptance Criteria

1. THE Application SHALL expose a frontend auth module that encapsulates sign-in, sign-out, session retrieval, and auth state change subscriptions
2. THE auth module SHALL provide the access token to the API client layer without exposing provider-specific objects to the API client layer (pages and components may access provider objects directly)
3. WHEN switching Auth_Provider in the future, THE Application SHALL require changes only within the auth module and Login page, not in App.tsx, route components, or other consuming code
4. THE auth module SHALL export a `getAccessToken()` function that the existing `setAuthTokenGetter` mechanism uses

### Requirement 5: Migration Path Constraints

**User Story:** As a developer, I want explicit guarantees about what stays stable when swapping providers, so that I can confidently build features on top of this identity layer.

#### Acceptance Criteria

1. WHEN a new Provider_Adapter is implemented, THE Application SHALL require no changes to the `users` table, `auth_identities` table, or application domain tables
2. WHEN a new Provider_Adapter is implemented, THE Application SHALL require no changes to route handlers or business logic
3. THE Auth_Service interface SHALL not expose provider-specific types (e.g., Supabase `Session`, Cognito `CognitoUser`) beyond the adapter module
4. THE Application SHALL store the active provider name in the `AUTH_PROVIDER` environment variable, enabling provider switching through configuration

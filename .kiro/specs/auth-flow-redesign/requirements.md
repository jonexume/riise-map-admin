# Requirements Document

## Introduction

This document defines the requirements for a comprehensive authentication flow redesign for RiiseMap. The current implementation only supports email/password sign-in via AWS Cognito with a basic login page. The redesign adds user self-service sign-up, password management (set, reset, forgot), email-as-username enforcement, and persistent user profile collection (first name, last name, organization name, organization type) stored as Cognito user attributes rather than localStorage.

## Glossary

- **Auth_System**: The combined frontend and backend authentication subsystem, including AWS Cognito User Pool configuration, Amplify SDK integration, and API middleware
- **Sign_Up_Page**: The frontend page where new users create an account
- **Sign_In_Page**: The frontend page where existing users authenticate with their credentials
- **Forgot_Password_Page**: The frontend page where users request a password reset code
- **Reset_Password_Page**: The frontend page where users set a new password using a verification code
- **Profile_Setup_Page**: The frontend page displayed after sign-up where users provide their first name, last name, organization name, and organization type
- **Cognito_User_Pool**: The AWS Cognito User Pool that manages user identities, credentials, and custom attributes
- **Verification_Code**: A time-limited numeric code sent to the user's email for account confirmation or password reset
- **Organization_Type**: A classification for the user's organization, one of: School/University, Corporation, or Workforce Development

## Requirements

### Requirement 1: User Sign-Up with Email as Username

**User Story:** As a new user, I want to create an account using my email address as my username, so that I have a single identifier for authentication.

#### Acceptance Criteria

1. WHEN a user navigates to the Sign_Up_Page, THE Auth_System SHALL display fields for email address and password
2. WHEN a user submits valid sign-up credentials, THE Auth_System SHALL create a new account in the Cognito_User_Pool with the email address as the username
3. WHEN a user submits an email address already registered in the Cognito_User_Pool, THE Auth_System SHALL display an error message indicating the account already exists
4. THE Auth_System SHALL enforce that the email field accepts only valid email format (contains @ and a domain)
5. WHEN a user submits a password that does not meet the Cognito_User_Pool password policy, THE Auth_System SHALL display an error message describing the specific policy violation

### Requirement 2: Email Verification After Sign-Up

**User Story:** As a new user, I want to verify my email address after signing up, so that the system confirms I own the email account.

#### Acceptance Criteria

1. WHEN a user completes sign-up, THE Auth_System SHALL send a Verification_Code to the registered email address
2. WHEN a user submits a valid Verification_Code, THE Auth_System SHALL mark the account as confirmed and allow sign-in
3. WHEN a user submits an invalid or expired Verification_Code, THE Auth_System SHALL display an error message and allow the user to request a new code
4. WHEN a user requests a new Verification_Code, THE Auth_System SHALL send a fresh code to the registered email address
5. WHILE the account is unconfirmed, THE Auth_System SHALL prevent the user from accessing protected application routes

### Requirement 3: User Sign-In

**User Story:** As a registered user, I want to sign in with my email and password, so that I can access the application.

#### Acceptance Criteria

1. WHEN a user submits valid credentials on the Sign_In_Page, THE Auth_System SHALL authenticate the user and redirect to the application
2. WHEN a user submits invalid credentials, THE Auth_System SHALL display an error message indicating authentication failure without revealing whether the email or password is incorrect
3. THE Sign_In_Page SHALL provide a navigation link to the Sign_Up_Page for users without an account
4. THE Sign_In_Page SHALL provide a navigation link to the Forgot_Password_Page for users who cannot remember their password

### Requirement 4: Forgot Password Flow

**User Story:** As a user who has forgotten my password, I want to request a password reset, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user submits their email address on the Forgot_Password_Page, THE Auth_System SHALL send a Verification_Code to that email address if the account exists
2. IF the email address is not associated with any account, THEN THE Auth_System SHALL display the same confirmation message as for a valid email to prevent account enumeration
3. WHEN a user receives the Verification_Code, THE Auth_System SHALL display the Reset_Password_Page where the user can enter the code and a new password
4. WHEN a user submits a valid Verification_Code and a compliant new password on the Reset_Password_Page, THE Auth_System SHALL update the password and redirect the user to the Sign_In_Page
5. WHEN a user submits an invalid or expired Verification_Code on the Reset_Password_Page, THE Auth_System SHALL display an error and allow the user to request a new code

### Requirement 5: Password Policy Enforcement

**User Story:** As a system administrator, I want passwords to meet security requirements, so that user accounts are protected.

#### Acceptance Criteria

1. THE Auth_System SHALL enforce a minimum password length of 8 characters
2. THE Auth_System SHALL require at least one uppercase letter, one lowercase letter, one number, and one special character in the password
3. WHEN a user enters a password on the Sign_Up_Page or Reset_Password_Page, THE Auth_System SHALL display real-time feedback indicating which policy criteria are met and which are not
4. THE Auth_System SHALL validate the password against the policy on the client side before submission to provide immediate feedback

### Requirement 6: Profile Information Collection During Sign-Up

**User Story:** As a new user, I want to provide my name and organization details during account setup, so that the application is personalized for me.

#### Acceptance Criteria

1. WHEN a user completes email verification, THE Auth_System SHALL display the Profile_Setup_Page before granting access to the main application
2. THE Profile_Setup_Page SHALL require the user to enter their first name, last name, organization name, and Organization_Type
3. WHEN a user submits the Profile_Setup_Page with all required fields populated, THE Auth_System SHALL store first name and last name as Cognito user attributes (given_name, family_name)
4. WHEN a user submits the Profile_Setup_Page, THE Auth_System SHALL store organization name and Organization_Type as Cognito custom attributes (custom:org_name, custom:org_type)
5. IF a user submits the Profile_Setup_Page with any required field empty, THEN THE Auth_System SHALL display a validation error for each missing field
6. WHILE the user has not completed the Profile_Setup_Page, THE Auth_System SHALL redirect the user to the Profile_Setup_Page on each authenticated session start

### Requirement 7: Sign-Out

**User Story:** As an authenticated user, I want to sign out of the application, so that my session is terminated securely.

#### Acceptance Criteria

1. WHEN a user triggers sign-out, THE Auth_System SHALL revoke the current session tokens and redirect to the Sign_In_Page
2. WHEN a user signs out, THE Auth_System SHALL clear all locally cached authentication state

### Requirement 8: Session Persistence and Token Refresh

**User Story:** As a returning user, I want to remain signed in across browser sessions, so that I do not need to re-enter credentials on every visit.

#### Acceptance Criteria

1. WHILE a user has a valid refresh token stored locally, THE Auth_System SHALL automatically obtain new access tokens without requiring re-authentication
2. WHEN the refresh token expires or is invalid, THE Auth_System SHALL redirect the user to the Sign_In_Page
3. IF token refresh fails due to a network error, THEN THE Auth_System SHALL retry the refresh once before redirecting to the Sign_In_Page

### Requirement 9: Navigation Between Auth Pages

**User Story:** As a user, I want clear navigation between authentication pages, so that I can easily find the correct action (sign in, sign up, reset password).

#### Acceptance Criteria

1. THE Sign_In_Page SHALL display a link to the Sign_Up_Page with text indicating account creation
2. THE Sign_In_Page SHALL display a link to the Forgot_Password_Page
3. THE Sign_Up_Page SHALL display a link to the Sign_In_Page for users who already have an account
4. THE Forgot_Password_Page SHALL display a link to return to the Sign_In_Page
5. THE Reset_Password_Page SHALL display a link to return to the Sign_In_Page

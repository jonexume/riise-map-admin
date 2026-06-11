export interface AuthResult {
  providerUserId: string;
  email: string;
  provider: string;
}

export interface AuthService {
  validateToken(token: string): Promise<AuthResult>;
}

export class AuthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthValidationError";
  }
}

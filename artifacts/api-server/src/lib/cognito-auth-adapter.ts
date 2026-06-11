import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AuthService, AuthResult } from "./auth-service";
import { AuthValidationError } from "./auth-service";

export class CognitoAuthAdapter implements AuthService {
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private issuer: string;
  private clientId: string;

  constructor(userPoolId: string, clientId: string) {
    const region = userPoolId.split("_")[0];
    this.issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`));
    this.clientId = clientId;
  }

  async validateToken(token: string): Promise<AuthResult> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.clientId,
      });

      if (payload.token_use !== "id") {
        throw new AuthValidationError("Expected id token");
      }

      return {
        providerUserId: payload.sub!,
        email: payload.email as string,
        provider: "cognito",
      };
    } catch (err) {
      if (err instanceof AuthValidationError) throw err;
      throw new AuthValidationError("Invalid or expired token");
    }
  }
}

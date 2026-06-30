import type { Request, Response, NextFunction } from "express";
import { createAuthService } from "../lib/auth-factory";
import { AuthValidationError } from "../lib/auth-service";

const authService = createAuthService();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    const result = await authService.validateToken(token);
    (req as any).user = result;
  } catch (err) {
    if (err instanceof AuthValidationError) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(401).json({ error: "Auth verification failed" });
  }

  next();
}

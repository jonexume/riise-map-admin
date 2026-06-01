import type { Request, Response, NextFunction } from "express";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") return next();
  if (!supabaseUrl || !supabaseServiceKey) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceKey,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    (req as any).user = await response.json();
  } catch {
    return res.status(401).json({ error: "Auth verification failed" });
  }

  next();
}

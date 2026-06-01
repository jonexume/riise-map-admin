import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — auth middleware disabled");
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!supabase) {
    return next();
  }

  // Skip auth for preflight CORS requests
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  (req as any).user = user;
  next();
}

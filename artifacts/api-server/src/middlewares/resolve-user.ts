import type { Request, Response, NextFunction } from "express";
import { db, usersTable, organizationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export async function resolveUser(req: Request, _res: Response, next: NextFunction) {
  const auth = (req as any).user;
  if (!auth?.providerUserId) return next();

  try {
    // Upsert user, update last_seen
    const [user] = await db
      .insert(usersTable)
      .values({
        cognitoSub: auth.providerUserId,
        email: auth.email,
        provider: auth.provider || "cognito",
      })
      .onConflictDoUpdate({
        target: usersTable.cognitoSub,
        set: { lastSeenAt: sql`now()` },
      })
      .returning();

    // If user has no org, create one
    if (!user.orgId) {
      const [org] = await db
        .insert(organizationsTable)
        .values({ name: auth.email.split("@")[0] })
        .returning();

      await db.update(usersTable).set({ orgId: org.id }).where(eq(usersTable.id, user.id));
      user.orgId = org.id;
    }

    (req as any).dbUser = user;
  } catch {
    // Non-fatal
  }

  next();
}

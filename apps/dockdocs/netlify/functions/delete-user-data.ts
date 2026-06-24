import type { Config, Context } from "@netlify/functions";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { dbDelete, dbSelect } from "./_shared/supabase-admin";

// DELETE /api/delete-user-data — wipes all flow_templates + flow_runs for the
// authenticated user from Supabase. Called from AccountClient "Private Space"
// section after the user confirms. Requires a valid Supabase session token.

const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { Allow: "POST" });
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN" }, 403);
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  // Count before deleting so we can return meaningful stats.
  let templateCount = 0;
  let runCount = 0;
  try {
    const [templates, runs] = await Promise.all([
      dbSelect<{ id: string }>("flow_templates", `user_id=eq.${encodeURIComponent(user.id)}`, "id"),
      dbSelect<{ id: string }>("flow_runs", `user_id=eq.${encodeURIComponent(user.id)}`, "id"),
    ]);
    templateCount = templates.length;
    runCount = runs.length;
  } catch {
    // Count is informational — proceed with delete even if select fails.
  }

  await Promise.all([
    dbDelete("flow_templates", `user_id=eq.${encodeURIComponent(user.id)}`),
    dbDelete("flow_runs", `user_id=eq.${encodeURIComponent(user.id)}`),
  ]);

  return json({
    ok: true,
    deleted: { templates: templateCount, runs: runCount },
  });
};

export const config: Config = {
  path: "/api/delete-user-data",
};

// Server-side Supabase admin client using the service_role key.
// Uses raw fetch (same as billing-auth.ts) — no SDK import, keeps bundle lean.
//
// The service_role key BYPASSES RLS, so every caller must pass an explicit
// user_id and enforce ownership in the query itself (eq filter on user_id).
// NEVER expose this key to the client.
//
// Required Netlify env var: SUPABASE_SERVICE_ROLE_KEY
// (set in Netlify Dashboard → Site configuration → Environment variables)

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

const SUPABASE_URL =
  Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL")?.trim() ||
  "https://kxoqgjtlfggsdhtwofoo.supabase.co";

function serviceRoleKey(): string {
  const key = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Add it in Netlify Dashboard → Site configuration → Environment variables.",
    );
  }
  return key;
}

function restHeaders(): Record<string, string> {
  const key = serviceRoleKey();
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "return=representation",
  };
}

/** POST /rest/v1/<table> — insert one row, return the created record. */
export async function dbInsert<T>(
  table: string,
  row: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...restHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase insert into ${table} failed (${res.status}): ${body}`);
  }
  const rows = (await res.json()) as T[];
  return rows[0];
}

/** GET /rest/v1/<table>?<query> — select rows. query is a PostgREST filter string. */
export async function dbSelect<T>(
  table: string,
  query: string,
  columns = "*",
): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(columns)}&${query}`;
  const res = await fetch(url, {
    method: "GET",
    headers: restHeaders(),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase select from ${table} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T[]>;
}

/** DELETE /rest/v1/<table>?<query> — delete matching rows. */
export async function dbDelete(table: string, query: string): Promise<void> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: restHeaders(),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase delete from ${table} failed (${res.status}): ${body}`);
  }
}

/**
 * Count registered auth users via the GoTrue admin API (auth.users isn't exposed
 * through PostgREST). Returns ONLY aggregate counts — { total, last7d }.
 *
 * 🔴 PRIVACY: each page response carries full user records (email, metadata).
 * They are tallied server-side and discarded immediately; NOTHING per-user is
 * returned, logged, or persisted. Caller must surface counts only.
 *
 * Paging terminates on the first EMPTY page. GoTrue clamps per_page to its own
 * server-side max (often 50) regardless of what we request, so a short page is
 * NOT the last page — only an empty one is. A 100-page cap is a runaway guard
 * (capacity = 100 × GoTrue's server max, far above the current user base); if
 * ever exceeded, total slightly under-counts rather than looping forever.
 */
export async function countAuthUsers(): Promise<{ total: number; last7d: number }> {
  const key = serviceRoleKey();
  const weekAgoMs = Date.now() - 7 * 86_400_000;
  const perPage = 200;
  let total = 0;
  let last7d = 0;
  for (let page = 1; page <= 100; page += 1) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GoTrue admin users failed (${res.status}): ${body}`);
    }
    const data = (await res.json()) as { users?: Array<{ created_at?: string }> };
    const users = data.users ?? [];
    // Terminate ONLY on an empty page. GoTrue clamps per_page to its server-side
    // max (often 50) regardless of the 200 we ask for, so a short page (< perPage)
    // is NOT the last page — inferring end-of-list from a short page would stop
    // after page 1 and badly under-count. Page until empty (or the 100-page cap).
    if (users.length === 0) break;
    total += users.length;
    for (const u of users) {
      const t = u.created_at ? Date.parse(u.created_at) : NaN;
      if (Number.isFinite(t) && t >= weekAgoMs) last7d += 1;
    }
  }
  return { total, last7d };
}

// Billing auth bridge. The app logs in with Supabase, so we identify the billing
// user from the Supabase access token the browser sends (Authorization: Bearer <jwt>).
// We resolve the token via Supabase's /auth/v1/user endpoint — this checks the
// signature, expiry, and revocation without us holding the JWT secret.

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

export type BillingUser = {
  id: string;
  email?: string;
  name?: string;
};

// Public values (safe to ship); override via Netlify env if the project moves.
const SUPABASE_URL =
  Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL")?.trim() ||
  "https://kxoqgjtlfggsdhtwofoo.supabase.co";
const SUPABASE_ANON_KEY =
  Netlify.env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")?.trim() ||
  "sb_publishable_xI4dJhuOlc63Q0lX1ICPPA_SPvspRQR";

export async function requireBillingUser(req: Request) {
  const user = await readBillingUser(req);
  if (!user) {
    return {
      ok: false as const,
      response: json(
        {
          ok: false,
          code: "UNAUTHORIZED",
          message: "Sign in before using billing.",
        },
        401,
      ),
    };
  }

  return {
    ok: true as const,
    user,
  };
}

export async function readBillingUser(req: Request): Promise<BillingUser | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });
    if (!res.ok) {
      return null;
    }
    const user = (await res.json().catch(() => null)) as
      | {
          id?: string;
          email?: string;
          user_metadata?: { name?: string; full_name?: string };
        }
      | null;
    if (!user?.id) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
    };
  } catch {
    return null;
  }
}

export function json(body: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers,
  });
}

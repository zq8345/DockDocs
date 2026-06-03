import { getUser, type User } from "@netlify/identity";

export type BillingUser = {
  id: string;
  email?: string;
  name?: string;
};

export async function requireBillingUser() {
  const user = await readBillingUser();
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

export async function readBillingUser(): Promise<BillingUser | null> {
  try {
    return toBillingUser(await getUser());
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

function toBillingUser(user: User | null | undefined): BillingUser | null {
  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

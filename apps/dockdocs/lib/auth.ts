// Supabase 版认证 API —— 替代 @netlify/identity。
// 暴露与原来相近的接口，登录 UI 只需改 import + 邮箱改魔法链接。
import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  pictureUrl: string | null;
};

function mapUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null {
  if (!u?.id) return null;
  const m = (u.user_metadata ?? {}) as Record<string, string>;
  return {
    id: u.id,
    email: u.email ?? null,
    name: m.full_name || m.name || null,
    pictureUrl: m.avatar_url || m.picture || null,
  };
}

export async function getUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  return mapUser(data.user);
}

// 订阅登录态变化；返回取消订阅函数
export function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(mapUser(session?.user ?? null));
  });
  return () => data.subscription.unsubscribe();
}

// 登录后跳回当前页(/account 与 /zh/account 均已是真实路由，按语言原样返回)
function redirectTo(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.origin + window.location.pathname;
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
  if (error) throw error;
}

export async function signInWithMicrosoft(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "azure", options: { scopes: "email openid profile", redirectTo: redirectTo() } });
  if (error) throw error;
}

// 邮箱魔法链接(免密码)：发链接到邮箱，点击即登录。同一封邮件里也含验证码
// （{{ .Token }}），用户可以直接点链接，或回登录页输入验证码（verifyEmailOtp）。
export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
  if (error) throw error;
}

// 邮箱验证码登录：verifyOtp 在客户端直接设置 session（不走 redirect 回调）。
// type "email" 对应 signInWithOtp 发出的邮箱 OTP；成功后 onAuthStateChange 会触发，
// 登录 UI 自动切到已登录态。错误（码错/过期/无效）原样抛出，由 UI 就地提示。
export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  email = email.trim();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

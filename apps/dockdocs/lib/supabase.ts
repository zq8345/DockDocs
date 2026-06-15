import { createClient } from "@supabase/supabase-js";

// publishable key 是公开值(可入库/前端)，用环境变量优先、内置默认兜底，保证构建即可用。
// 如需覆盖，在 Netlify 设 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kxoqgjtlfggsdhtwofoo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_xI4dJhuOlc63Q0lX1ICPPA_SPvspRQR";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // 自动处理 OAuth/魔法链接回调
    flowType: "pkce",
  },
});

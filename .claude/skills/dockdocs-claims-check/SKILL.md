---
name: dockdocs-claims-check
description: >-
  Use whenever you write or edit ANY user-facing copy in DockDocs — marketing
  pages (Home/About/Pricing), tool descriptions, FAQ, blog, AI-citation wording,
  privacy/no-upload statements, tool counts, encryption strength — or add a new
  tool/locale. Enforces the honesty moat (scoped privacy & citation claims, no
  over-claims) and makes the claims + privacy build guards pass. The honesty-
  about-limits IS the product's competitive moat; an over-claim breaks it.
---

# DockDocs 文案诚实守卫 (claims + privacy)

诚实 = DockDocs 的护城河（对手是数据饥渴的云端 AI；我们赢在"不上传 + 可溯源 + 坦白说不能做什么"）。**任何过度宣称都在拆护城河。** 历史上 de-claim 跑过 ~6 轮 en-centric grep 漏了非英语平行项两次；这两个守卫把教训冻成了 build-time 不变量。写/改文案 = 先懂规则、改完自检。

## 客户端 vs 服务端 = 唯一真源
`shared/templates/pdf-tool-page/pdf-runtime.ts` 的 **`cloudConvertRoutes`** 数组 = 仅有的服务端上传 slug（word/ppt/excel↔pdf、html→pdf、pdf→pdfa 等 ~8 个）。**在表里 = 上传到 CloudConvert；不在 + 走 `xxxLocally()` = 纯客户端**（pdf-lib/@cantoo/pdfjs/canvas/Tesseract-WASM，含 protect-pdf）。**永远只认这个引擎文件，绝不信注释 / badge / FAQ / usage-limits 注解**（它们误标过 protect-pdf）。

## 铁律（写文案必须遵守）
1. **隐私 — 必须 scoped，禁 blanket**：
   - 真客户端工具才可说 "runs in your browser / nothing uploaded / never leaves your device / verify in DevTools"。
   - 服务端 slug（在 cloudConvertRoutes）**绝不**说客户端/不上传；如要推荐隐私替代，写成 recommendation（"if you'd rather it never leave your device, use one of our client-side tools"）。
   - 站级 / 首页表述必须带 scope 词：`most / some / 多数 / browser tools / in the browser`。**禁** "all/~N tools run in your browser, files never leave" 无 scope（~8 个转换工具真上传）。
2. **AI citation — 必须 scoped**："shows the source **when it can locate it**, and says when it can't"。**永不** "every answer cites / each answer is sourced / always cites / 每个回答都引用 / sourced recommendation"（compare-recommend 无单一出处）。
3. **工具数**：用 `lib/claims.ts` 的 `TOOL_COUNT`，**禁** 硬编码 "N+ tools / N+ 工具"（漂移过 20+/50+）。
4. **加密强度**：全站统一 **AES-256**（引擎锁 AESV3）。绝不让某页写 128 某页写 256。
5. **法律 / 绝对化禁词**：court-ready、100% accurate/cited/guaranteed、零风险、法庭可用、完全性を保証 —— 一律禁。
6. **SSOT = `lib/claims.ts`**：`CITATION_SCOPE` / `BRAND_SLOGAN` / `TOOL_COUNT` 是单一真源，且必须 7 语齐全（en/zh/zh-Hant/es/pt/fr/ja）、非 en 值不得 === en（漏译泄漏）。改 claim → 改这里 + 全 7 语，别在散落文案里复制。

## ⚠️ 多面 sweep 清单（de-claim / 改 claim 必须全查 — 漏一面就破功）
首页 claims **有三源**，改一处必查另两处：
- `components/Home.tsx` — **渲染的** hero/sub/proof-badge/CTA（含 "0 … uploaded" 信任数字，最显眼，曾漏）
- `app/page.tsx` — en 根 `/` 的 JSON-LD
- `lib/page-schema.ts` — `homeSchema(locale)` / `HOME_FAQ` / `ORG_DESC` / `SITE_DESC`（/zh /es /pt /fr /ja /de 首页 + 品牌级描述，per-locale）

其余 claim 面：
- `lib/blog.ts`（**易漏** — 67ebb38 漏过 2 篇 19 处，终检 grep 才抓到）
- `lib/localized-tools.ts`（工具表 + FAQ，per-tool 隐私 claim）
- `components/PricingPlans.tsx`、`components/ToolFaq.tsx`、`components/GroundingNote*`（3 变体，且复用进 FAQPage JSON-LD）
- `app/[locale]/[[...slug]]/page.tsx` 的 `CUSTOM_TOOL_COPY`、`app/ai-workspace`、`app/for/*`

守卫已自动递归 walk `components/ lib/ app/` 的 .ts/.tsx，所以**漏面不是"守卫扫不到"，而是"你只改了英文、忘了 7 语平行项"** —— 改 banned/citation/privacy 措辞时，7 语一起改。

## 自检（写完必跑，也在 `npm run build` 的 postbuild 自动跑）
```
cd apps/dockdocs
node scripts/check-claims.mjs        # banned 措辞 · scope 共现 · 7语 parity · 工具数
node scripts/check-privacy-claims.mjs # claim vs 引擎 · F12 badge · blanket · 首页 · AES
```
任一 FAIL → exit 1，阻断 push。**绝不**为过守卫去放宽守卫；要么 scope 措辞，要么把 claim 移进 claims.ts。

## 守卫报错 → 怎么修
- `[banned]` — 过度宣称措辞：scope 它，或移进 `lib/claims.ts` import。
- `[scope]` `CITATION_SCOPE.<loc>` 无 qualifier — 加 "when it can locate it / 找得到原文时 / 并非每条" 一类 marker。
- `[parity]` `<NAME>.<loc>` MISSING / LEAK — 补全该语，或译掉（非 en 不得 === en）。
- `[B/badge]` 服务端 slug 进了 `LOCAL_ONLY_SLUGS`（VerifyClientSide.tsx）— 移除它，或别再服务端路由它。
- `[A/copy]` 服务端 slug 文案说了客户端 — 改成诚实的服务端表述（或写成"推荐客户端替代"）。
- `[C/blanket]` `[D/home]` 站级/首页 no-upload 无 scope — 加 most/browser tools/多数。
- `[E/aes]` AES 位数不一致 — 全站统一 256。

## ratchet 原则
守卫的 BANNED 列表只增不减。对抗式 review 发现新的过度宣称措辞 → 把它加进 `scripts/check-claims.mjs` 的 `BANNED`（或 privacy 的 `CLAIM`），永不放松。

## 何时把 claim 留着（不是所有"宣称"都禁）
能定位到原文时的可溯源 = 真卖点，保留（chat-with-pdf 的 citeYes）。通用科普 / 推荐客户端替代 / 用户侧引用 = 诚实，保留。守的是**普适化的过度宣称**，不是卖点本身。

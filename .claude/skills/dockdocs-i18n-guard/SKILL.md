---
name: dockdocs-i18n-guard
description: >-
  Use whenever you ADD a new locale to DockDocs, or change/add any user-facing
  copy that must exist in every locale (tool pages, FAQ, nav, marketing pages,
  AI widgets, GEO hubs, runtime/status strings). Encodes the hard-won add-locale
  playbook + the tsc-invisible blindspot checklist + the mandatory render
  verification. The core law: "build green + guards pass ≠ complete" — a missing
  locale key falls back to English SILENTLY and the static guards do NOT cover
  every surface. Every locale so far (es/ja/zh-Hant/de) leaked because of this.
---

# DockDocs i18n 守卫 (add-locale + 防静默英文兜底)

**核心铁律：`build 绿 + 守卫过 ≠ 完整`。** 缺一个 locale 键不会报错,会**静默兜回英文**——在默认语言下一切正常,只有切到目标语言去看才暴露。守卫只覆盖**部分**面,组件本地 copy 是盲区。每一门 locale(es/ja/zh-Hant/de)都栽在这。**所以渲染验证不可省。**

加一门 locale ≠ 翻译先行,是**多阶段类型工程**。顺序错(先填内容 Record、locale 没先成一等 RouteLocale)→ 7/8 语类型打架、105 错乱。

---

## 阶段 1 — 地基先行(类型层)

`lib/i18n.ts` 的 `routeLocales` 加 locale → `RouteLocale`/`AuthoredLocale` 自动含。引擎/leaf 类型用 `toEngineLocale` 把新 locale → `"en"` collapse(引擎/OCR/CloudConvert 无该语言串,英文兜底**合理**);UI copy 用真译文。

⚠️ **tsc 抓不到的硬编码盲区**(函数返回 union 但运行时漏判)——**必逐个 grep 同步,否则导航/内链/hreflang 静默丢 locale**:

| 盲区 | 症状 |
|---|---|
| `components/Header.tsx` 的 `stripLocale` | 当前 locale 误判 en → 点导航跳回英语 |
| `components/Footer.tsx` 的 `l()`(**第二个独立 stripLocale**)| 页脚链接丢前缀 |
| `lib/i18n.ts` 的 `isLocale`(被 `splitPathname`/`localizedHref` 用)→ 改用 `isRouteLocale` | blog/info/vertical/geo 内链丢 locale |
| `languageAlternates` hreflang map | hreflang 漏该语言 |
| shared `workflow-engine.tsx` 的 `makeTr` + `SUPPORTED_LOCALES` | **每个工具页运行时 micro-copy(拖拽/状态/按钮/结果/错误)全英文** |
| shared `pdf-tool-page/index.tsx` 的本地 `tr` / `indexingTr` / `templateCopy` / `schemaTr` | 模板 chrome(Benefits/Features/…)+ GEO 阅读链接 + JSON-LD slogan 兜英文 |
| 各组件**本地 `type Locale`**(Home/About/Pricing/SaasInfoPage/VerifyClientSide/Ai*Workflow/GroundingNote/RelatedPdfTools/GeoHubPage)| `COPY[locale] ?? COPY.en` 静默英文——**最常见的元凶** |
| `components/Header.tsx` 的 `navCategories` 导出 Record | Home/Hero/Sitemap/垂直页/dashboard 的工具名兜英文 |
| catch-all 的 `toLeafLocale` / `toAccountLocale` / `aiWidgetLocales` | 叶子页 + **交互 AI widget** UI 被 collapse 成 en |
| `lib/geo.ts` 的 `GeoLocale` + `geoLocales` + `geoHubCopy` + `workflowLinks` | GEO hub 页整页英文 |
| `lib/tier-config.ts` | 定价配额 micro-copy |
| `scripts/fix-html-lang.mjs` 的 `PREFIX_LOCALES` | 整 /<locale>/ 树 ship `<html lang=en>` |
| `lib/page-schema.ts` Org slogan/description、`sitemap.ts` | 品牌级描述 + 站点地图 |

**查法**:`grep '=== "zh"'` 链 / locale 字面量数组 / `isLocale(` 调用点 / 各组件 `type Locale =` / `Record<"en"`,逐一确认含新 locale。

---

## 阶段 2 — BODY 翻译(内容层)

地基加完,typed-exhaustive build **精确点名**所有缺口 → 逐个填。一门 locale 大头:
`lib/localized-tools.ts` 的 `<loc>Tools`(31 工具全字段)+ `ToolFaq.tsx` 的 `FAQS_<LOC>`(42 slug)+ `copy.ts` 的 `runtimeCopy.<loc>` + catch-all `CUSTOM_TOOL_COPY` + `lib/claims.ts`(7 语齐)≈ **~3000 行**。
**质量**:遵守 `dockdocs-claims-check` skill(scoped 隐私/citation、AES-256、品牌词 verbatim)。AI 初翻后**必须母语复审**(lean-validate 不等于母语级)。

---

## 阶段 3 — arm 守卫

`scripts/check-i18n-coverage.mjs`:从 `PARTIAL_LOCALES` 移除新 locale + 加进 `BODY_LOCALES`/`FAQ_LOCALES` → 守卫要求完整,红 build 兜底漏翻。中途可用 `PARTIAL_LOCALES={loc}` 让其暂为英文兜底、build 绿、非阻塞——但那是 partial,**别上 prod**。

---

## 阶段 4 — 渲染验证(不可省!守卫的盲区在这堵)

守卫只验"路由存在 + 工具页 body/FAQ/runtimeCopy/claims",**不验组件本地 per-locale COPY object**。所以必须**爬 out/<locale>/ 每页可见文本**:

1. `npm run build` 出 `out/`。
2. 跑可见文本扫描(剥 `<head>`/`<script>`/`<style>` + 去标签 + 解实体 → 只留正文),flag 英文专属标记词(the/your/with/for/click/upload/never/"runs in your browser"…),**过滤目标语言 loanword**(德语的 Workflow/Download/Tool 不算泄漏)。参考脚本模式见 `apps/dockdocs/scripts/_de_leak_*.mjs`。
3. **跨 locale 分类**:同一英文串在 es/fr/ja **也是英文** → 是策略(blog 标题/GEO 指南卡片 = 全副语言英文,`toBlogContentLocale`/`getTopGuides` 兜 en,**不动**);只有目标 locale 英文、es/fr/ja 已译 → **真漏,必修**。
4. 点 Header/Footer 导航确认保留 /<locale>/ 前缀(地基盲区①②的回归测)。
5. **交互 AI widget**(ai-workspace/chat/summary/analyzer):它们走 `aiWidgetLocales`,需组件 de 块 + prop union + `engineLocale` 兜底(UI=新 locale,引擎仍 en),catch-all 才能 flip。`AiChatWorkflow.tsx` 是正确范例。

---

## 完成判据(才算"locale 完整")
tsc 0 + `next build` 绿(含 bracket route——`tsc` 跳过 `app/[locale]/`,只 next build 真验,见 `dockdocs-prepush` 盲区)+ claims/privacy/coverage 守卫过 + **渲染扫描真实泄漏归零(策略英文除外)** + 抽样母语质量 OK + git diff 只含该 locale 文件。

## 根因与长期解
每门 locale 都痛 = **字符串分散**(无 canonical store,散在模板/组件/runtime/nav/claims/schema/geo)。本 skill 是"照清单把每个藏字符串处翻出来"的稳健 workaround。长期根治 = 排一个"字符串向中央仓库收口 + 守卫覆盖全部面"的重构(计划项,非急活)。

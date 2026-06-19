# DockDocs 多语言（i18n）覆盖复盘 & Playbook

> 写于 2026-06-19，基于一次把 **ja（日语）从 noindex POC 转为全量上线** 并顺带补齐 es/pt/fr 的实战。目的：**下次再加一门语言（例如繁体中文 zh-Hant）时少走弯路**。
>
> 一句话教训：**本次 90% 的工作不是"翻译"，而是"找出代码里把新语言悄悄降级成英文的地方"**。翻译本身好做；难的是泄漏点分散在十几处、且各不相同。

---

## 0. 先读这段：核心架构陷阱（不懂这个会反复踩坑）

1. **`type Locale = ["en","zh"]` 只有两个值**（`lib/i18n.ts`）。es/pt/fr/ja **不是** `Locale` 的成员，而是在各处以字符串字面量**手工追加**：`Locale | "es" | "pt" | "fr" | "ja"`。
   - 后果：任何 `Record<Locale, T>` **只覆盖 en/zh**。新语言的数据要么放进单独的 map，要么得把这个 `Record` 的键类型显式加宽。`geoHubCopy: Record<Locale,…>` 当初就只有 en/zh，导致 es/pt/fr/ja 全渲染英文。
2. **正文 ≠ SEO metadata ≠ runtime，是三条独立的本地化链**。一个工具页可能正文已是日文，但：
   - `<title>`/`<meta description>` 来自 `app/[locale]/[[...slug]]/page.tsx` 的另一套逻辑；
   - 转换进度/报错来自 `shared/templates/pdf-tool-page/*-runtime.ts`；
   三者任一漏了就泄漏。**修一个不代表修了全部。**
3. **postbuild 脚本会覆盖部分 SEO 信号**，不要被源码误导：
   - `<html lang>` 由 `scripts/fix-html-lang.mjs` 在构建后改写（源码 layout 里是写死 `lang="en"`，**不是 bug**）。
   - hreflang 由 `scripts/inject-hreflang.mjs` 读取产物 + robots meta 注入（`lib/i18n.ts` 里那个 `languageAlternates()` 其实已失效，别信它）。
   - 所以**验证 SEO 一定要看 `out/` 产物，不能只看源码**。
4. **ja 的 runtimeCopy 是"浅合并覆盖"**：`getRuntimeCopy("ja")` = `{ ...runtimeCopy.en, ...runtimeCopyJa }`。`runtimeCopyJa` 缺哪个段，哪个段就回退英文。es/pt/fr 是完整的顶层条目，ja 是 patch——**两套机制，容易顾此失彼**。

---

## 1. 泄漏的根因模式（下次直接按这张表 grep 排查）

| # | 模式 | 例子 | 为什么守卫/肉眼容易漏 |
|---|---|---|---|
| A | **显式降级钳制** `locale === "ja" ? "en" : locale` | page.tsx 把 ja 传给组件前压成 en；AccountMenu、PricingPlans、5×ToolBridge、DocumentCompare、AiSummary… | 组件本身有 ja，钳制在**调用点**，离泄漏现场远 |
| B | **二元 `=== "zh"` 三元** `zh ? 中文 : 英文` | workflow-engine、pdf-runtime、ocr-runtime、cloudconvert-runtime、UploadDropzone、index.tsx | es/pt/fr/ja **全部**落到英文分支；守卫的正则抓不到（不是 `? "en"` 形）|
| C | **locale 联合缺新语言** `"en"\|"zh"\|"es"\|"pt"\|"fr"`（无 ja） | AccountLocale、MembershipLocale、DashLocale、flow-runs、extra-tool-schema、cloudconvert | 类型层静默回退 `?? en` |
| D | **`Record<Locale,…>` 只含 en/zh** | geoHubCopy、blogIndexCopy、tier-config(早期) | 因为 `Locale` 本身就只有 en/zh（见陷阱 0.1）|
| E | **en/zh-only 数据集 + 路由级 uiLocale 钳制** | GEO 指南 hub、blog；`const uiLocale: "en"\|"zh" = rawLocale === "zh" ? "zh" : "en"` | 整页内容回退；需要**写新内容**，不只是改类型 |
| F | **硬编码英文字面量**（无 locale 参数） | OCR 的 `throw new Error("…")`、aria-label、UploadPanel/ResultPreview | 守卫与类型都抓不到；只能肉眼/截图发现 |
| G | **死代码带过时 locale 假设** | `LanguageSwitcher.tsx`(未引用)、index.tsx 里的 RelatedPdfTools、`languageAlternates()` | 误导排查（"这里漏了！"其实根本没渲染）|

---

## 2. 泄漏藏在哪些"面"（按这张清单逐面验，别靠用户截图）

工具页正文 / 工具页 **SEO `<title>+desc`**（模板页 vs 自定义页两套）/ 工具页 FAQ / **转换·处理 runtime**（pdf/ocr/cloudconvert，全是 shared 二元）/ 上传预览 chrome（dropzone、file card、Remove、aria）/ AI 控件 + 其**服务端报错** / 账户·登录·`AccountMenu`·计费·升级·定价对比表 / 首页 + 首页 JSON-LD / About / 信息·法律页 / **Nav·Header·Footer·语言切换器** / GEO 指南 hub / blog / dashboard / GroundingNote 等品牌块 / **SEO 信号**（html lang、hreflang、sitemap、robots index/noindex）。

> 经验：用户连续发了 ~7 张截图，每张一个**不同**的面。与其等截图，不如**派一个独立审计 agent 按上表逐面 grep + 读产物**，一次拿到全清单。

---

## 3. 防回归：已落地的护栏（务必沿用 + 扩展）

1. **`scripts/i18n-locale-guard.mjs`**（已接入 `postbuild`）：扫 **模式 A**（`=== "X" ? "en"`）和 **模式 C**（缺 ja 的 5 语联合）。命中即 fail build。合法例外用行内注释 `// i18n-guard-allow: <理由>`。当前 **0 违规 / 0 例外**。
   - **局限**：抓不到模式 B（二元 `=== "zh"`，因为太多合法 en/zh-only 路由会误报）、模式 F（硬编码字面量）、模式 E（en/zh-only 数据）。下次加语言时**先扩展它**（见 §5 建议）。
2. **`scripts/check-i18n-parity.mjs`**：保证 83 条路由的工具正文 + FAQ 在各 locale 齐全。
3. **`pick(locale, Record<Locale,string>)` 模式 = 编译期防漏**：用 `Record<完整Locale, string>` 做 map，少一门语言**直接 tsc 报错**。ai-workspace 控件就是这么做到"不可能漏"的。**新代码一律用这个模式，禁止裸三元。**

---

## 4. 下次加一门语言（如 zh-Hant）的分步清单 ✅

> 先做 §5 的"地基加固"，再按此清单。每步做完跑 `npx tsc --noEmit` + `npm run build`（含守卫）。

**A. 注册 & 类型**
- [ ] `lib/i18n.ts`：把新 locale 加进 `routeLocales` / `allLocales`（注意 `locales` 仍是 en|zh，新语言走"追加字面量"约定）。
- [ ] 全仓 grep `"en" | "zh" | "es" | "pt" | "fr" | "ja"`，给**每一处**联合追加新 locale（AccountLocale、MembershipLocale、DashLocale、GeoLocale、CloudLocale、OcrLocale、RuntimeLocale 追加点、各 `*Client` 的本地 `Locale`、extra-tool-schema、flow-runs…）。守卫会帮你逼出来。

**B. 内容（翻译）—— 按 §2 每个面**
- [ ] `lib/localized-tools.ts`：新增 `xxTools`（31 工具：title/desc/hero/benefits/features/steps/cta）+ `xxFaq`。
- [ ] `app/[locale]/[[...slug]]/page.tsx`：自定义页的 `metaLocale` picker 加新语言（~26 块 SEO title/desc）。
- [ ] runtime：`pdf-runtime` / `ocr-runtime` / `cloudconvert-runtime` / `workflow-engine(-components)` 的 `tr(...)` 加一列。
- [ ] copy：`runtimeCopy` 加完整新 locale 顶层条目（**别学 ja 用浅合并 patch，直接给完整条目更省心**）。
- [ ] 组件：AccountClient、AccountMenu、UpgradeFlow、PricingPlans、membership-ui、tier-config（定价表）、GroundingNote、RelatedPdfTools、UploadDropzone、AI 控件、Home、AboutPage、Header/Footer。
- [ ] 数据：`lib/geo.ts`(geoHubCopy + workflowLinks)、`lib/i18n.ts` infoPages、`page-schema.ts`(HOME_FAQ/ORG_DESC/SITE_DESC + inLanguage)。
- [ ] 服务端：`netlify/functions/ai-*.ts` 的 `pick` map + `_shared/answer-locale.ts`（`AnswerLocale` + `answerLanguageName`）。

**C. SEO**
- [ ] `<html lang>`：`scripts/fix-html-lang.mjs` 的 `PREFIX_LOCALES` 加新 locale（注意 BCP47，如 `zh-Hant`）。
- [ ] hreflang：`scripts/inject-hreflang.mjs` 的 `SECONDARY` 加新 locale（脚本按 robots 决定是否纳入 cluster——**noindex 的页自动排除**）。
- [ ] sitemap：`shared/seo/routes.ts` 把新 locale 从 `INCOMPLETE_LOCALES` 移除（或等价机制）；若分阶段索引，仿照 `isJaNativeRoute` 写一个"原生路由"断言。
- [ ] **先 noindex**：母语审校通过前，新 locale 像 ja 那样 `robots:{index:false}`，只对有原生内容的面放开（`isJaNativeRoute` 模式）。

**D. 质量门（务必，顺序很重要）**
- [ ] `tsc --noEmit` 0 错 + `npm run build` 4/4 绿 + 守卫 0 违规。
- [ ] **独立母语审核（writer≠reviewer）**：派一个**没写这些翻译**的 agent，按 es/pt/fr/ja 各维度审（语法/性数/重音/标点惯例/术语一致/SEO 长度/无残留英文/隐私声明未被翻反）。**只读、产出 must-fix**。
- [ ] 修完 must-fix → 再 build → 才摘 noindex / 部署。

**E. 部署**
- [ ] 合并到 master → Netlify 自动部署 dockdocs.app（注意本环境**出站被封，无法 curl 生产**；验证靠 `out/` 产物 + GitHub commit status + 让用户/朋友测）。

---

## 5. 让"下一门语言"变机械的建议（地基加固，强烈推荐先做）

1. **消灭裸三元**：把所有 `zh ? : ` / `locale === "x" ? :` 的**显示字符串**逐步迁移到 `pick(locale, Record<Locale,…>)`。一旦如此，加语言 = 给每个 Record 加一个键，**漏了就编译失败**，再也不用肉眼找。
2. **扩展守卫**抓更多模式：
   - 模式 B：可对 `*-runtime.ts` / 组件**目录级**启用"二元 `=== "zh"` 即告警"（这些文件不该有 en/zh-only 路由），但要配 allowlist。
   - 模式 F：扫描 JSX 文本节点 / `aria-label="..."` / `throw new Error("ASCII…")` 的硬编码英文。
3. **统一 locale 真源**：考虑把 `Locale` 直接定义成 6（现在 12 UI 语只有 6 有内容）的完整集合，干掉"字面量追加"约定——一处改，全仓类型自动要求新键。
4. **runtimeCopy 统一成完整条目**，废弃 ja 的浅合并 patch（patch 容易漏段，本次 ja dashboard/ocr/compress/pricing 就是这么漏的）。
5. **清死代码**（`LanguageSwitcher.tsx` 已删；`languageAlternates()`、index.tsx 的 RelatedPdfTools 待清）——死代码会误导排查。

---

## 6. 本次已知遗留（不阻塞，记录在案）

- **Blog**（index + 文章）：仅 en/zh，其余 locale 回退英文，且 ja blog/programmatic-GEO 保持 noindex —— **设计如此**。要覆盖需写大量正文，属独立内容任务。
- **`for/legal` · `for/finance` · `for/research`** 垂直页：有 es/pt/fr 内联 map，ja 为 noindex，未全 6 语。
- **UploadPanel / ResultPreview**：内部工作区，默认英文 common copy，无 locale 入参（低流量）。
- **BatchFileCard 的 `removeLabel`**：已加可本地化属性，但 ~15 个 batch 调用方尚未逐个传入（aria-only，最低优先）。
- **`copy.ts` runtimeCopyJa 的 Latin 间距不统一**：旧段（shell/common/chat/summary）用"紧贴"式（`PDFを`/`AI出力`/`25 MBまで`），本次新增段与全 app 约定用"半角空格"式（`PDF を`/`AI 要約`）。两种都是合法日语，但同一对象内不一致（~64 处紧贴）。正解是把旧段归一为空格式以对齐全 app；因量大且 sed 易误伤合法复合词，留作**独立归一化任务**（非索引 runtime/dashboard 面，cosmetic）。

---

## 7. 流程上最省时间的三条心得

1. **先审计、再动手**：用一个独立 agent 出"逐面 × 逐语言"覆盖矩阵 + 泄漏清单，胜过被用户截图一张张推着打地鼠。
2. **大批量翻译派 agent，结构/类型改动自己把关**：本次 page.tsx 的 26 块、geoHubCopy 340 行、runtime ~250 串都由 agent 批量做；计费/路由等敏感结构自己改。**文件不重叠**地分工，可 2 个 agent 并行（**别 6 路 fan-out，会触发风控**）。
3. **每批都过独立母语审核再上线**：本次多轮审核共抓出"定价页全英文""双 を CTA""Not found 兜底"等若干 must-fix——自评会漏。

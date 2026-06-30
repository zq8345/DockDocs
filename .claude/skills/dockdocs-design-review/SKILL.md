---
name: dockdocs-design-review
description: >-
  Use to review the DESIGN / UX QUALITY of a rendered DockDocs page — distinct
  from functional QA. Functional tests only catch "does it work"; this catches
  "is it well-laid-out, on-brand, intuitive, and good-looking." Run on the
  marketing / hero / tool pages (home, download, pricing, tool pages, workspace)
  after any visual change, before declaring it done. Critique the RENDERED PIXELS
  (screenshots), never the code. Output a prioritized issue list, not pass/fail.
---

# DockDocs 设计评审 (design / UX quality)

**功能能用 ≠ 设计合格。** 功能测试有明确 oracle(做没做到),设计/UX 没有——所以烂布局只要功能能用就溜过 QA,长期把质量问题全漏掉。DockDocs 靠质量/打磨竞争(对标 Supabase),设计漏 = 拆护城河。这份 rubric 把"好看/合理/好用"拆成可对照的检查项 + 显式对标,让设计质量像 claims/i18n 一样有标尺。

## 怎么用(process — 铁律:看像素不看代码)
1. **截图真实渲染**:线上(dockdocs.app)或 preview,**desktop ~1440 + mobile ~390 两个视口**。绝不从代码/描述判断("代码看着对"正是栽过的坑——nav 颜色 bug 是 globals 未分层 CSS,只有看渲染才抓到)。
2. 逐项对照下面【设计语言】+【检查清单】,并**显式对标 Supabase 对应板块**(并排比"我们哪里更业余")。
3. 输出**优先级问题清单**,每条:`[P0|P1|P2] <页面/区块> — <问题> → <具体改法>`。
   - **P0** = 尴尬/破碎,ship-blocker(布局错位、撞车、空得离谱、明显业余)。
   - **P1** = 明显低于 bar(间距乱、层级不清、与其他页不一致)。
   - **P2** = 打磨(微调对齐/节奏/细节)。
4. 末尾一句**总评**:够不够 Supabase 级?(够 / 接近 / 不够),并指出最该先修的 1-2 条。
5. **诚实**:看着业余就说业余,别编好评(护城河靠真质量不靠自我感觉);客观项你判,微妙的"高级感/品牌气质"标注「需 Joe 定」。

## DockDocs 设计语言(品牌标尺 — 源自 CLAUDE.md)
- **Supabase 风暗色优先**:绿 `--accent #3ecf8e` 打在暖近黑 `--background #171717` 上。
- **深度靠 1px `--line` 边框**(hover `--line-strong`),**不用阴影**。
- **绿色只上 CTA / 链接 / 小强调**,不做大块填充;绿按钮用深色 `--on-accent` 文字。
- **标题字重 400**(层级靠**字号**不靠加粗);mono `--faint` eyebrow(`// LABEL`)。
- **`max-w-6xl` 居中**,留白充裕。营销页(Home/About)平 `#171717`,分割线**只在**页眉下 + 页脚上。
- 上传 UX:缩略图 + 文件大小 + 明确成功/拒绝反馈。可溯源徽章在有的工具上要可见。

## 检查清单(每条都钉在真踩过的坑上)
1. **容器宽度**:与同级核心页一致(`max-w-6xl`)——不比别的页窄/宽。〔下载页曾 max-w-3xl 偏窄〕
2. **对齐**:内容块对齐统一左缘网格;nav/hero/各区共享左边界;无孤立偏移;nav 视觉对**页面**居中(不是对剩余空间)。〔nav 曾不居中〕
3. **颜色纪律**:静默文字 `--muted`(不是满屏纯白);绿只在强调/CTA;token 一致无野色;同级元素同色(四个 nav 项颜色必须一致)。〔nav 三项曾被全局 `a{}` 染白〕
4. **视觉层级**:每区一个清晰焦点;字号/字重/色彩引导视线;主 CTA 一眼可见。
5. **间距节奏**:区块纵向节奏一致;padding 一致;无局促也无漂浮;相关项靠近成组(proximity)。
6. **平衡 / 密度**:不空(留白要有内容支撑)也不挤;内容有目的地填满宽度。〔下载页曾"太空"〕
7. **动效**(若有):有目的、流畅、干净循环、传达产品价值;**不是几张静图拼的幻灯片**;参考真实产品的"逐行揭示"质感。〔demo 曾是 3-tab 拼图,改 split-view 逐行〕
8. **响应式**:mobile(~390)合理堆叠;无溢出、无超小字;触控目标 ≥40px。
9. **跨页一致**:这页和 home/about/pricing 像不像同一个产品?同字阶、同间距、同组件。
10. **内容真实 + 诚实**:mock 内容像真的(非 lorem);文案 claims scoped(跑 [[dockdocs-claims-check]]);本地化页无英文兜底泄漏(跑 [[dockdocs-i18n-guard]] 的渲染验证)。

## 显式对标 Supabase(强制)
打开 supabase.com 对应板块(Table Editor / SQL Editor 那种 app-frame 演示、hero、定价表),并排比:
- 间距/呼吸感谁更克制?层级谁更清晰?
- 演示 mock 谁更真实、更有"产品在动"的感觉(逐行揭示 vs 静态)?
- 整体谁看着更"贵"/更可信?我们差在哪一具体处?→ 写成 P0/P1 + 改法。

## 诚实边界
AI 能稳抓**客观/启发式问题**(宽度、对齐、颜色、层级、间距、响应式断裂、动效呆板)——这些占 Joe 手动挑出的绝大多数。最微妙的品牌气质/高级感仍需 Joe 终判。**目标:这份评审接掉 ~80% 客观设计问题,Joe 只 spot-check 那 20%。** 别为了"过"而放水——放水 = 设计-QA 洞没补。

## 已定的设计决策(别重复 flag — 省 critic 反复提已定的事)
- **☰ 桌面端收纳式菜单 = 刻意设计**(Joe 2026-06-25 把次级项收进 ☰ + 加线条图标),不是缺陷。**别建议**"桌面摊开 nav / 去掉 ☰ / 学 Supabase 把更多项放 nav"。
- **nav 重心偏左 ~22px** 在可接受范围(Joe 2026-06-29 定不动)。别再 flag。
- (新决策落定就往这里补,让 critic 只盯未定的问题。)

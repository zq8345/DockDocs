# DOCK Design System v1

DOCK Design System v1 defines the shared product language for DockDocs, DockIMG, DockText, and FateBeat. The system is built for practical SaaS workspaces: white surfaces, restrained contrast, clear hierarchy, low visual noise, and AI-first workflows that make input, reasoning, and output easy to understand.

DockDocs is the reference implementation for v1. Current UI patterns include a sticky product header, workflow landing sections, upload panels, result previews, dashboard cards, and the Chat with PDF workspace with document sidebar, conversation area, and source intelligence panel.

## Product Principles

1. AI workspace first: every surface should answer what was uploaded, what the system is doing, what it produced, and what the user can do next.
2. SaaS clarity over tool-site density: avoid large tool grids as the primary identity. Utilities are workflow entry points inside a document platform.
3. Quiet by default: prefer white, black, neutral gray, and one restrained blue accent.
4. State visibility: empty, selected, loading, success, and error states must be explicit and placed near the user action that caused them.
5. Responsive by construction: desktop can use workspace columns; tablet and mobile must stack without horizontal overflow.

## Design Tokens

### Colors

Use semantic tokens instead of raw color values in product UI.

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--background` | `#f8fafc` | `#0f172a` | Page background |
| `--surface` | `#ffffff` | `#111c31` | Cards, panels, upload zones |
| `--surface-subtle` | `#f3f6fa` | `#172033` | Subtle nested areas and neutral empty states |
| `--foreground` | `#111827` | `#f8fafc` | Primary text and black CTA |
| `--muted` | `#667085` | `#a7b0c0` | Secondary text, labels, metadata |
| `--line` | `#d9e1ea` | `#27364d` | Borders and dividers |
| `--accent` | `#2563eb` | `#60a5fa` | Primary blue action and active states |
| `--accent-strong` | `#1e3a8a` | `#bfdbfe` | Accent text on soft blue |
| `--soft-accent` | `#dbeafe` | `#172c4f` | Selected navigation, icon wells, subtle highlights |
| `--success` | `#166534` | `#bbf7d0` | Success text |
| `--success-surface` | `#f0fdf4` | `#052e16` | Success background |
| `--success-line` | `#bbf7d0` | `#166534` | Success border |
| `--error` | `#991b1b` | `#fecaca` | Error text |
| `--error-surface` | `#fef2f2` | `#450a0a` | Error background |
| `--error-line` | `#fecaca` | `#991b1b` | Error border |
| `--warning` | `#92400e` | `#fde68a` | Warning text |
| `--warning-surface` | `#fffbeb` | `#451a03` | Warning background |
| `--warning-line` | `#fde68a` | `#92400e` | Warning border |

Rules:

- Use blue only for product actions, active state, focus emphasis, and light AI/workspace signals.
- Do not create one-off purple, orange, or heavy gradient palettes for product surfaces.
- Use neutral status text unless the state needs success, warning, or error attention.
- Keep all status color pairs readable against both light and dark modes.

### Typography

Font stack:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Scale:

| Role | Size | Weight | Line height | Usage |
| --- | --- | --- | --- | --- |
| Display | 48-60px desktop, 36-48px mobile | 600 | 1.05-1.15 | Landing and tool page H1 only |
| Page title | 36-48px | 600 | 1.1-1.2 | Dashboard and workspace page headers |
| Section title | 28-36px | 600 | 1.15-1.25 | Major page sections |
| Panel title | 18-24px | 600 | 1.25 | Cards, upload panels, result panels |
| Body | 14-18px | 400-500 | 1.6-1.75 | Descriptions and content |
| Label | 11-13px | 600 | 1.2 | Eyebrows, metadata, status labels |

Rules:

- Do not scale typography with viewport width.
- Letter spacing is `0` by default. Uppercase labels may use `0.12em` to `0.16em`.
- Reserve display type for first-screen hero or equivalent page-level moments.
- Keep dense workspace panels at body and panel-title sizes; do not use hero type inside sidebars.

### Radius

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `8px` | Buttons, compact nav items, status pills |
| `--radius` | `12px` | Cards, upload zones, inputs, panels |
| `--radius-lg` | `16px` | Large workspace shells only |

Rules:

- Default component radius is `12px`.
- Do not nest card-looking containers inside card-looking containers unless the inner element is a repeated item, status block, or input surface.
- Avoid excessive pill shapes except for compact metadata and nav chips.

### Spacing

Base spacing scale:

| Token | Value |
| --- | --- |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |

Rules:

- Use `16px` to `24px` for normal card padding.
- Use `32px` to `64px` for page section rhythm.
- Use `8px` to `12px` for compact controls and dense workspace gaps.
- Keep mobile page padding at `20px` minimum and desktop page padding at `32px` when possible.

### Grid

Page containers:

- Marketing and tool pages: `max-width: 1280px`, centered.
- Workspace pages: full width with constrained inner grid when needed.
- Dashboard: sidebar plus content on desktop, stacked on tablet/mobile.

Column patterns:

- Tool hero desktop: `0.78fr / 1.22fr` or similar, text plus upload panel.
- Generic runtime pages: two columns, upload and result.
- Chat workspace desktop: document sidebar, conversation, source panel.
- Tablet: two columns only when both columns remain at least `320px`.
- Mobile: single column, upload/action first, output next.

Rules:

- No horizontal overflow at `390px`, `768px`, and `1280px`.
- Use stable dimensions for boards, sidebars, toolbars, upload zones, and status blocks.
- Avoid layout shifts when status text changes.

## Component Rules

### Buttons

Types:

- Primary: filled accent blue for the main next action.
- Secondary: bordered neutral button for alternate routes.
- Ghost: neutral text button for low-risk navigation and compact header actions.
- Danger: error surface and error text for destructive or unrecoverable actions.

Rules:

- Minimum touch target: `44px` height.
- Radius: `8px` for buttons and compact controls.
- Button labels must be action verbs: `Upload PDF`, `Start chat`, `Copy`, `Download`.
- Disabled buttons must explain why through adjacent state text or placeholder guidance.
- Do not use multiple primary buttons in the same decision area.
- Loading buttons must keep their size stable and expose `aria-busy`.

### Inputs

Rules:

- Use `--surface` background, `--line` border, `--foreground` text, and `--muted` placeholder.
- Focus state should use accent border or outline.
- Inputs in AI workspaces should support multiline text when the user is asking questions.
- Error messages must appear directly under or near the input group that failed.

### Upload Zones

Required content:

- Drag and drop affordance.
- Select file CTA.
- Supported formats.
- File size limit.
- Current state.
- Error or success feedback.

States:

- Empty: show supported input and why to upload.
- Selected: show file name and next runtime step.
- Processing: show progress indicator and disable duplicate upload action.
- Success: confirm output is ready and reveal next action.
- Error: show problem and user-correctable instruction.

Rules:

- Upload zones should be large enough to be the obvious first action on tool pages.
- The icon/file badge should communicate document type without making the product feel like a generic PDF utility site.
- Limits must be visible before file selection.

### Cards

Variants:

- Default: `--surface`, `--line`, 12px radius.
- Elevated: default card plus restrained shadow for primary upload/workspace surfaces.
- Interactive: default card plus border and small lift on hover.
- Muted: `--surface-subtle` for empty states, nested status areas, and compact previews.

Rules:

- Cards represent repeated items, panels, upload/result surfaces, dashboard stats, or modal-like framed tools.
- Use `--surface`, `--line`, and `12px` radius.
- Avoid decorative shadows except for primary upload/workspace surfaces where depth clarifies interactivity.
- Keep card headings compact and scannable.
- Do not use raw hex colors for status cards; use success, warning, and error tokens.

### Navigation

Global nav groups:

- AI: Chat with PDF, AI Summary, OCR.
- Convert: PDF to Word.
- Optimize: Compress PDF.
- Documents.
- Dashboard.
- Settings.

Rules:

- Header brand must be visible, compact, and legible at mobile widths.
- Primary navigation should wrap gracefully before overflowing.
- Active states use `--soft-accent` plus `--accent-strong`.
- Keep cross-product navigation consistent across DockDocs, DockIMG, DockText, and FateBeat.
- Language switching stays visible on mobile but should not displace the primary page action.
- Header controls may wrap into multiple rows at 390px; horizontal scrolling is not acceptable.

### Workspace Layout

Required workspace areas:

- Left: document, collection, history, or object context.
- Center: primary work surface such as conversation, editor, image canvas, or task stream.
- Right: sources, references, properties, previews, or inspector.

Rules:

- Desktop can use three columns.
- Tablet should collapse to two columns or stacked inspector.
- Mobile should become a single-column task flow with primary action first.
- Side panels must be useful but not visually heavier than the main workspace.
- Chat with PDF mobile order: document/upload status, chat input, conversation, then sources/references.

### Dashboard IA

Dashboard surfaces should look like an AI Document Platform control center, not a static link hub.

Required areas:

- Overview: documents, conversations, summaries, and workflows.
- Recent Documents: document name, type, status, and next action.
- Recent Conversations: question or task, source document, and source/result status.
- AI Actions: Chat with PDF, Summarize, OCR, Convert, and Compress.
- Workspace Health: storage, processing, and provider placeholder status.
- Recommended Next Steps: one to three action-oriented suggestions.

Rules:

- Dashboard cards use 12px radius and `--surface` / `--surface-subtle`.
- Mobile dashboard stacks into a single column with overview and empty-state guidance before dense lists.
- Provider status can be a placeholder unless a real account/runtime integration exists.

### Content Surfaces

Content pages include Blog, Guides, Resources, GEO hubs, programmatic GEO articles, and SaaS trust/info pages. They should feel like product documentation inside the DockDocs workspace, not a separate SEO microsite.

Surface rules:

- Use `--surface` for main reading sections and `--surface-subtle` for supporting panels, quick answers, metadata cards, and nested list blocks.
- Use `--line` for borders and dividers; avoid raw hex borders in content components.
- Use `--muted` for summaries, excerpts, metadata, table secondary cells, and helper text.
- Use `--foreground` for headings, strong values, and dark CTA surfaces.
- Content cards use `12px` radius. Compact inline links, list items, and step rows use `8px`.
- Shadows should be restrained and should clarify grouping only; content pages should not look like stacked marketing cards.

Reading layout:

- Hero content should stay under roughly `max-w-4xl`.
- Article body columns should keep readable text around `max-w-3xl` to `max-w-4xl`; sidebars should be secondary and sticky only on desktop.
- Tables may scroll horizontally inside their own framed container, but the page itself must not overflow at `390px`.
- Use section spacing of `48px` to `64px` on desktop and tighter `32px` to `48px` on mobile.

CTA placement:

- Content hero pages may include one primary CTA and one secondary CTA.
- Long articles should end with a single framed CTA surface that returns users to the relevant workflow.
- In-page SEO/GEO links should use neutral secondary styling, not primary button styling, unless they are the main next action.

Mobile content rules:

- At `390px`, all content cards, quick answers, tables, and CTA rows must stack without horizontal page overflow.
- CTA buttons may wrap but must remain at least `44px` high.
- Sidebar metadata should appear after the hero content or stack below the primary article content.
- Chinese and English headings must use `break-words` when they can contain long file, product, or workflow names.

### Empty States

Rules:

- Empty states should state what is missing and what action unlocks the workspace.
- Use neutral surfaces and concise copy.
- Include one primary CTA only.
- Do not use decorative illustrations as the main explanation.

### Loading States

Rules:

- Loading states must preserve layout dimensions.
- Show the exact process when known: `Reading PDF text`, `Generating summary`, `Compressing PDF`.
- Use a restrained progress bar or skeleton, not large animations.
- Disable duplicate submit actions while processing.

### Error States

Rules:

- Use `--error`, `--error-surface`, and `--error-line`.
- Error copy must be actionable: file type, file size, provider configuration, or extraction issue.
- Keep provider/runtime errors visible in the relevant workspace area without exposing unnecessary implementation detail to end users.
- Never replace the whole page with an error for recoverable upload or chat failures.

### Success States

Rules:

- Use `--success`, `--success-surface`, and `--success-line`.
- Success must reveal the generated output, not just say `Done`.
- Pair success with next actions: copy, download, start chat, summarize, export, or open dashboard.

## Responsive Rules

Breakpoints:

- Mobile: `0-639px`.
- Tablet: `640-1023px`.
- Desktop: `1024px+`.
- Wide desktop: `1280px+`.

Rules:

- Mobile pages use single-column layout and keep upload/CTA visible before secondary content.
- Tablet may use two columns only when content remains readable.
- Desktop workspaces may use multi-column layouts with side panels.
- Navigation must wrap or stack without clipping.
- Test critical pages at `390`, `768`, and `1280` widths.

## Accessibility Rules

1. Use semantic landmarks: `header`, `main`, `nav`, `section`, `aside`, and `form`.
2. Every upload input must have a visible label or an accessible label through its enclosing label.
3. Buttons must be real `button` elements unless they navigate, in which case use links.
4. Interactive elements need visible hover and focus states.
5. Status updates should be close to the related control and readable without color alone.
6. Color contrast targets: 4.5:1 for body text, 3:1 for large text and UI boundaries.
7. Do not rely only on icons for critical actions unless the icon has an accessible name.
8. Maintain keyboard flow from upload to result to next action.

## Pre-Production UI Audit Rules

### Token Consolidation

- Content, tool, and workspace surfaces should use semantic tokens from `app/globals.css`.
- Avoid raw hex values in component classes except inside token definitions, brand SVG fills, canvas drawing code, or shadows.
- Use one card radius rhythm: `--radius` for cards and panels, `--radius-sm` for compact controls and inputs.
- Metadata helpers should pass a clean page title to the root layout. Do not ship duplicate `| DockDocs | DockDocs` suffixes.

### Interactive Components

- Hover states must be subtle: border color, opacity, or surface shift rather than heavy animation.
- Focus states must be visible for buttons, links, inputs, upload zones, cards used as buttons, and language controls.
- Disabled and loading states must keep the same dimensions as the active state.
- Mobile tap targets should be at least `44px` tall for primary actions, upload controls, nav controls, and dashboard actions.

### Mobile Workspace QA

- At `390px`, the task path order is upload or document status, primary input, result or conversation, then sources or references.
- Header and footer may wrap, but must not force horizontal scroll.
- Content cards, dashboard cards, and tool panels collapse to one column before text becomes cramped.
- Result previews and next actions should remain close to the upload or processing area on mobile.

## Future Product Rules

### DockDocs

- Keep the identity as `AI Document Platform`, not a PDF tool collection.
- Every document runtime should expose upload, runtime state, output, and follow-up action.
- AI features should show source grounding whenever possible.

### DockIMG

- Use the same token system with image-specific workspace surfaces: asset tray, canvas, inspector, export panel.
- Keep image generation/editing controls compact and professional.
- Avoid overly playful palettes unless a specific campaign requires it.

### DockText

- Reuse the workspace model for editor, prompt/actions, review panel, and export/copy states.
- Preserve typographic clarity as the primary brand signal.
- Status language should be writing-specific: draft, rewrite, review, ready.

### FateBeat

- Reuse SaaS shell, navigation rhythm, cards, and state colors.
- If FateBeat requires a more expressive product mood, contain it in content imagery and product-specific accents, not shared controls.
- Dashboard and timeline components should follow the same spacing, card, and responsive rules.

## Implementation Notes

- Current source tokens live in `app/globals.css`.
- Shared component patterns live in `components` and `shared/ui`.
- New product UI should import or mirror shared primitives before adding local ad hoc styles.
- Raw hex colors are allowed only when introducing or revising semantic tokens.
- Runtime, provider, deploy, SEO, and API logic are outside the Design System scope.

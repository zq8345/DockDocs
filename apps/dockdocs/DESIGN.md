# DockDocs Design Decisions

## App Shell — 5-Zone Dashboard Layout

### Sticky Topbar (implemented 2026-06-28)

**Purpose:** Display the active tool name at all times — before upload, during processing, and after output — so users never lose context.

**Structure:**
```
┌─── WorkspaceSidebar (240px fixed) ─── | ──── main (flex-1) ───────────────┐
│  logo (48px high)                     │  <header> sticky topbar (48px)    │
│  nav items                            │  ─────────────────────────────────│
│  ...                                  │  <div overflow-y-auto flex-1>      │
│                                       │    tool content / home / history   │
│                                       │  </div>                            │
└───────────────────────────────────────┴────────────────────────────────────┘
```

**Rules:**
- `<header>` is the FIRST child of `<main>` (before the scroll div), `shrink-0`
- Height: `48px` — matches sidebar logo row for horizontal alignment
- Background: `bg-[color:var(--background)]` opaque (not surface, not transparent)
- Border: `border-b border-[color:var(--line)]`
- Padding: `px-6`
- Tool label `<h1>` inside topbar: `text-[14px] font-semibold leading-none truncate`
- Label is shown only when `activeTool && toolLabel` — empty topbar when on home screen
- Scroll div below: `flex flex-1 flex-col overflow-y-auto` — content scrolls, topbar stays fixed

**Why `overflow-y-auto` on the scroll div, not `<main>`:**
`<main>` has `flex flex-col overflow-hidden`. The topbar `shrink-0` takes exactly 48px.
The scroll div gets `flex-1` and scrolls independently. Scrolling content is always
occluded by the opaque topbar — never bleeds over it.

**Tool clients — embedded prop pattern:**
Every client rendered inside the workspace receives `embedded={true}`.
When `embedded`:
- `h1` title hidden (`{!embedded && <h1>}`) — title is in the sticky topbar instead
- `ToolSections` and `ToolFaq` hidden — marketing content not shown in workspace
- Container padding: `pt-4` instead of `pt-12 sm:pt-16`
- Thumbnail grids (delete-page, reorder-pages): `max-h-[150px] object-contain` on images
  to keep grid compact (full-height thumbnails would require excessive scrolling)
- WatermarkEditorClient: side-by-side form+preview stacks vertically in embedded mode

**Future: PWA / Desktop (Electron/Tauri)**
This `<header>` becomes the app's title bar area. On desktop:
- macOS: set `titlebar-area-*` CSS env vars; traffic light buttons sit left of topbar
- Windows: drag region on the topbar (no traffic lights)
- The 48px height is already comfortable for all platforms
- The sidebar logo row aligns with topbar — creating a single top rail across the whole shell

## Tool Consistency Rule (client + engine tools must match)

Any tool opened in the workspace must present identically:

```
[sticky topbar — tool title, 48px]
[subtitle — one sentence of value copy, text-[color:var(--muted)]]
[upload zone — max-w-3xl centered (before upload), moderate not full-width]
[trust row — privacy / size limit]
```

**Engine tools** (`WORKFLOW_ENGINE_SLUGS` → `PdfToolPageEmbedded`):
- Subtitle: `config.heroDescription` — same field used by the public HeroSection
- Upload zone: already max-w-3xl (no change needed)

**Client tools** (`CUSTOM_RENDERERS` → `*Client.tsx`):
- Subtitle: `t.subtitle` from the tool's copy — guard it from `{!embedded && ...}` removal; always show
- Upload zone: `<UploadDropzone ... constrained={embedded} />` — adds `mx-auto max-w-3xl` wrapper when in workspace
- After upload (thumbnail grid, result area): outer `max-w-5xl` stays; grid needs column width

**Why constrained only on upload zone, not outer container:**
After upload the client tool renders a thumbnail grid that needs `max-w-5xl` for comfortable column widths. The outer container stays wide; only the idle-state `UploadDropzone` is narrowed via the `constrained` prop.

**WatermarkEditorClient — special case:**
Uses vertical stack (preview top + form below). Form centered with `mx-auto max-w-[360px]`. Preview width is aspect-ratio aware: portrait `max-w-[360px]`, landscape `max-w-[560px]`. Watermark overlay uses column-based anchor: left column → left-align, center → center, right → right-align, preventing text from overflowing document boundary.

---

**Adding a new embedded tool:**
1. Create the client component with `embedded?: boolean = false` prop
2. Guard: `{!embedded && <h1>}`, `{!embedded && <ToolSections>}`, `{!embedded && <ToolFaq>}`
3. Padding: `${embedded ? "pt-4" : "pt-12 sm:pt-16"}` on outer container
4. Add to `CUSTOM_RENDERERS` in `WorkspacePdfTool.tsx` with `embedded` prop
5. The sticky topbar picks up `toolLabel` automatically from `headerStructure`

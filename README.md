# Dock AI Ecosystem Monorepo

This monorepo manages the Dock AI brand ecosystem:

- `dockdocs.app` in `apps/dockdocs`
- `dockimg.app` in `apps/dockimg`
- `dockseo.app` in `apps/dockseo`
- `docktext.app` in `apps/docktext`

The apps use Next.js App Router, TailwindCSS, shared Dock navigation, shared footer, shared UI primitives, shared SEO helpers, responsive layouts, and automatic dark mode.

## Structure

```text
Dock/
├── apps/
│   ├── dockdocs/
│   ├── dockimg/
│   ├── dockseo/
│   └── docktext/
├── shared/
│   ├── components/
│   ├── ui/
│   ├── seo/
│   └── config/
├── package.json
├── turbo.json
└── README.md
```

## Install

```bash
npm.cmd install
```

## Run One App

```bash
npm.cmd run dev:dockdocs
npm.cmd run dev:dockimg
npm.cmd run dev:dockseo
npm.cmd run dev:docktext
```

## Build

```bash
npm.cmd run build
```

Build a single app:

```bash
npm.cmd run build:dockdocs
```

## Shared System

- Brand data: `shared/config`
- Header, Footer, Related Tools, site home layout: `shared/components`
- Reusable UI primitives: `shared/ui`
- Metadata helpers: `shared/seo`

Update `shared/config/brands.ts` when domains, descriptions, or Dock brand labels change.

## Netlify

Each app includes its own `netlify.toml` and can be deployed independently from its app directory.

Recommended Netlify settings per site:

- Base directory: `apps/dockdocs` or the relevant app
- Build command: `npm run build`
- Publish directory: `.next`

Use the matching domain for each Netlify site:

- `dockdocs.app`
- `dockimg.app`
- `dockseo.app`
- `docktext.app`

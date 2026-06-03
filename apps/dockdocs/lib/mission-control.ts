import { existsSync, readdirSync, statSync } from "fs";
import path from "path";

export type MissionTone = "ready" | "watch" | "blocked";

export type MissionMetric = {
  label: string;
  value: string;
  helper: string;
  tone: MissionTone;
};

export type MissionLane = {
  label: string;
  owner: string;
  status: string;
  tone: MissionTone;
  signal: string;
};

export type MissionTask = {
  title: string;
  area: string;
  priority: "P0" | "P1" | "P2";
  status: string;
};

export type MissionGate = {
  label: string;
  state: string;
  detail: string;
  tone: MissionTone;
};

export type MissionEvidence = {
  label: string;
  detail: string;
};

export type MissionAgent = {
  name: string;
  role: string;
  status: string;
  tone: MissionTone;
};

export type MissionControlSnapshot = {
  generatedAt: string;
  summary: {
    status: string;
    detail: string;
    tone: MissionTone;
  };
  metrics: MissionMetric[];
  lanes: MissionLane[];
  gates: MissionGate[];
  queue: MissionTask[];
  evidence: MissionEvidence[];
  agents: MissionAgent[];
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "../..");

function listFiles(directory: string, matcher: (filePath: string) => boolean) {
  if (!existsSync(directory)) {
    return [];
  }

  const found: string[] = [];
  const entries = readdirSync(directory);

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      found.push(...listFiles(fullPath, matcher));
      continue;
    }

    if (matcher(fullPath)) {
      found.push(fullPath);
    }
  }

  return found;
}

function countRoutePages() {
  return listFiles(path.join(appRoot, "app"), (filePath) =>
    filePath.endsWith(`${path.sep}page.tsx`),
  ).length;
}

function countDocs() {
  const dockdocsDocs = listFiles(path.join(appRoot, "docs"), (filePath) =>
    filePath.endsWith(".md") || filePath.endsWith(".json"),
  );
  const repoDocs = listFiles(path.join(repoRoot, "docs"), (filePath) =>
    filePath.endsWith(".md") || filePath.endsWith(".txt"),
  );

  return {
    dockdocsDocs: dockdocsDocs.length,
    repoDocs: repoDocs.length,
    seoDocs: repoDocs.filter((filePath) =>
      filePath.includes(`${path.sep}seo${path.sep}`),
    ).length,
  };
}

function countRuntimeModules() {
  return listFiles(path.join(appRoot, "lib"), (filePath) =>
    filePath.endsWith("-runtime.ts"),
  ).length;
}

function hasNetlifyConfig() {
  return existsSync(path.join(appRoot, "netlify.toml"));
}

function hasPlaywrightConfig() {
  return existsSync(path.join(appRoot, "playwright.config.ts"));
}

function toneForCount(count: number, readyAt: number): MissionTone {
  if (count >= readyAt) {
    return "ready";
  }

  return count > 0 ? "watch" : "blocked";
}

export function getMissionControlSnapshot(): MissionControlSnapshot {
  const routeCount = countRoutePages();
  const docs = countDocs();
  const runtimeModules = countRuntimeModules();
  const deployConfigReady = hasNetlifyConfig();
  const testHarnessReady = hasPlaywrightConfig();
  const generatedAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date());

  const gates: MissionGate[] = [
    {
      label: "Deploy configuration",
      state: deployConfigReady ? "Ready" : "Blocked",
      detail: deployConfigReady
        ? "Netlify settings are present for the DockDocs app."
        : "Netlify settings are missing from the app root.",
      tone: deployConfigReady ? "ready" : "blocked",
    },
    {
      label: "Regression harness",
      state: testHarnessReady ? "Ready" : "Watch",
      detail: testHarnessReady
        ? "Playwright configuration is available for route checks."
        : "Add a browser test harness before production release.",
      tone: testHarnessReady ? "ready" : "watch",
    },
    {
      label: "Runtime coverage",
      state: runtimeModules >= 6 ? "Ready" : "Watch",
      detail: `${runtimeModules} runtime modules are visible to Mission Control.`,
      tone: toneForCount(runtimeModules, 6),
    },
    {
      label: "SEO operating record",
      state: docs.seoDocs >= 20 ? "Ready" : "Watch",
      detail: `${docs.seoDocs} SEO monitoring artifacts are tracked in repo docs.`,
      tone: toneForCount(docs.seoDocs, 20),
    },
  ];

  const blockers = gates.filter((gate) => gate.tone === "blocked").length;
  const watches = gates.filter((gate) => gate.tone === "watch").length;

  return {
    generatedAt,
    summary: {
      status: blockers > 0 ? "Blocked" : watches > 0 ? "Watching" : "Operational",
      detail:
        blockers > 0
          ? `${blockers} release gate needs attention before ship.`
          : watches > 0
            ? `${watches} gate is under watch while Phase 1 remains usable.`
            : "All Phase 1 release gates are currently green.",
      tone: blockers > 0 ? "blocked" : watches > 0 ? "watch" : "ready",
    },
    metrics: [
      {
        label: "Route inventory",
        value: String(routeCount),
        helper: "App Router pages visible to operations",
        tone: toneForCount(routeCount, 20),
      },
      {
        label: "Runtime modules",
        value: String(runtimeModules),
        helper: "Client and server workflow stores",
        tone: toneForCount(runtimeModules, 6),
      },
      {
        label: "SEO evidence",
        value: String(docs.seoDocs),
        helper: "Tracked crawl, schema, and indexing docs",
        tone: toneForCount(docs.seoDocs, 20),
      },
      {
        label: "Knowledge base",
        value: String(docs.dockdocsDocs + docs.repoDocs),
        helper: "DockDocs and repo operating documents",
        tone: toneForCount(docs.dockdocsDocs + docs.repoDocs, 30),
      },
    ],
    lanes: [
      {
        label: "DEV",
        owner: "Hermes DEV",
        status: "Active",
        tone: "ready",
        signal: "DEV-300 is queued as the premium AI workspace implementation lane.",
      },
      {
        label: "UI",
        owner: "Hermes UI",
        status: "Active",
        tone: "ready",
        signal: "UI-300 is tracked for workspace experience and release surface checks.",
      },
      {
        label: "OPS",
        owner: "Codex",
        status: deployConfigReady ? "Ready" : "Blocked",
        tone: deployConfigReady ? "ready" : "blocked",
        signal: "OPS-010 and OPS-011 are tracked for provider setup and production guardrails.",
      },
      {
        label: "SEO",
        owner: "GPT",
        status: docs.seoDocs >= 20 ? "Live" : "Watch",
        tone: toneForCount(docs.seoDocs, 20),
        signal: "Search evidence and GSC reports stay visible without changing SEO strategy.",
      },
      {
        label: "GEO",
        owner: "Hermes PMO",
        status: "Watch",
        tone: "watch",
        signal: "AI search readiness remains in a separate review lane.",
      },
    ],
    gates,
    queue: [
      {
        title: "DEV-300 premium AI workspace implementation",
        area: "DEV",
        priority: "P0",
        status: "Open",
      },
      {
        title: "UI-300 premium workspace interface readiness",
        area: "UI",
        priority: "P1",
        status: "Open",
      },
      {
        title: "OPS-010 Google OAuth enablement follow-up",
        area: "OPS",
        priority: "P1",
        status: "Queued",
      },
      {
        title: "OPS-011 production login validation follow-up",
        area: "OPS",
        priority: "P2",
        status: "Backlog",
      },
    ],
    evidence: [
      {
        label: "Generated",
        detail: `${generatedAt} UTC from repo-local files.`,
      },
      {
        label: "Route scan",
        detail: `${routeCount} page files found under apps/dockdocs/app.`,
      },
      {
        label: "Docs scan",
        detail: `${docs.repoDocs} repo docs and ${docs.dockdocsDocs} DockDocs docs found.`,
      },
      {
        label: "Release scan",
        detail: `${gates.filter((gate) => gate.tone === "ready").length}/${gates.length} release gates ready.`,
      },
    ],
    agents: [
      {
        name: "GPT",
        role: "Planning and content coordination",
        status: "Watching",
        tone: "watch",
      },
      {
        name: "Hermes PMO",
        role: "Queue ownership and cross-window handoff",
        status: "Active",
        tone: "ready",
      },
      {
        name: "Hermes DEV",
        role: "Development execution lane",
        status: "Active",
        tone: "ready",
      },
      {
        name: "Hermes UI",
        role: "Interface execution lane",
        status: "Active",
        tone: "ready",
      },
      {
        name: "Codex",
        role: "Operations verification and release safety",
        status: "Active",
        tone: "ready",
      },
    ],
  };
}

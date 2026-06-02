import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import process from "node:process";
import ts from "typescript";

const appRoot = process.cwd();
const sourcePath = path.join(appRoot, "lib", "programmatic-geo.ts");
const llmsPath = path.join(appRoot, "public", "llms.txt");
const outDir = path.join(appRoot, "out");
const outSitemapPath = path.join(outDir, "sitemap.xml");
const outLlmsPath = path.join(outDir, "llms.txt");
const siteUrl = "https://dockdocs.app";

const expectedPrioritySlugs = [
  "compress-pdf-for-email",
  "compress-pdf-for-gmail",
  "compress-pdf-for-outlook",
  "reduce-pdf-size-under-10mb",
  "compress-pdf-on-mac",
  "ocr-pdf-to-copyable-text",
  "ocr-pdf-accuracy-guide",
  "copy-text-from-scanned-pdf",
  "scanned-pdf-ocr-accuracy",
  "ai-summarize-pdf-report",
  "chat-with-pdf-workflow",
  "ai-pdf-for-contract-review",
  "ai-pdf-summary-limitations",
  "ai-pdf-vs-manual-review",
  "ocr-vs-pdf-to-word",
  "pdf-to-word-vs-ai-summary",
  "local-pdf-processing-vs-cloud",
  "online-ocr-vs-desktop-ocr",
  "pdf-tools-for-lawyers",
  "pdf-tools-for-students",
];

const allowedSchemaTypes = new Set(["Article", "TechArticle"]);
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function wordCount(value) {
  return String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function routeFor(page) {
  return `/${page.surface}/${page.slug}/`;
}

function loadProgrammaticGeoModule() {
  const source = fs.readFileSync(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: sourcePath,
  }).outputText;

  const compiledModule = new Module(sourcePath);
  compiledModule.filename = sourcePath;
  compiledModule.paths = Module._nodeModulePaths(appRoot);

  const originalLoad = Module._load;
  Module._load = function load(request, parent, isMain) {
    if (request === "@/lib/i18n") {
      return {
        siteUrl,
        defaultLocale: "en",
        absoluteUrl: (href) =>
          href.startsWith("http")
            ? href
            : `${siteUrl}${href.startsWith("/") ? href : `/${href}`}`,
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    compiledModule._compile(output, sourcePath);
    return compiledModule.exports;
  } finally {
    Module._load = originalLoad;
  }
}

const geo = loadProgrammaticGeoModule();
const seeds = geo.getProgrammaticGeoPageSeeds();
const prioritySlugs = geo.priorityGeoPageSlugs ?? [];
const uniqueKeys = new Set(seeds.map((seed) => `${seed.surface}/${seed.slug}`));

if (seeds.length !== uniqueKeys.size) {
  fail(`Programmatic GEO slugs are not unique: ${seeds.length} seeds, ${uniqueKeys.size} unique routes.`);
}

if (seeds.length < 160) {
  fail(`Expected at least 160 Programmatic GEO pages, found ${seeds.length}.`);
}

if (prioritySlugs.length !== 20) {
  fail(`Expected exactly 20 priority pages, found ${prioritySlugs.length}.`);
}

for (const slug of expectedPrioritySlugs) {
  if (!prioritySlugs.includes(slug)) {
    fail(`Missing expected priority slug: ${slug}`);
  }
}

const seedBySlug = new Map(seeds.map((seed) => [seed.slug, seed]));
const prioritySeeds = seeds.filter((seed) => seed.priority);

if (prioritySeeds.length !== 20) {
  fail(`Expected 20 seeds with priority: true, found ${prioritySeeds.length}.`);
}

for (const seed of seeds) {
  const label = routeFor(seed);
  const page = geo.getProgrammaticGeoPage("en", seed.surface, seed.slug);

  if (!page) {
    fail(`${label} cannot be resolved with getProgrammaticGeoPage.`);
    continue;
  }

  if (!allowedSchemaTypes.has(page.schemaType)) {
    fail(`${label} uses unsupported schemaType: ${page.schemaType}`);
  }

  if (!page.quickAnswer) fail(`${label} missing quickAnswer.`);
  if (!page.aiAnswerSnippet) fail(`${label} missing aiAnswerSnippet.`);
  if (!page.aiCitationSummary) fail(`${label} missing aiCitationSummary.`);
  if (!page.bestFor?.length) fail(`${label} missing bestFor.`);
  if (!page.notBestFor?.length) fail(`${label} missing notBestFor.`);
  if (!page.limitations?.length) fail(`${label} missing limitations.`);
  if (!page.relatedTools?.length) fail(`${label} missing relatedTools.`);
  if (!page.relatedGuides?.length) fail(`${label} missing relatedGuides.`);

  const snippetWords = wordCount(page.aiAnswerSnippet);
  if (snippetWords < 40 || snippetWords > 70) {
    fail(`${label} aiAnswerSnippet must be 40-70 words, found ${snippetWords}.`);
  }

  const citationWords = wordCount(page.aiCitationSummary);
  if (citationWords < 8 || citationWords > 70) {
    fail(`${label} aiCitationSummary should stay concise, found ${citationWords} words.`);
  }

  if (page.cluster === "comparison" && !page.comparisonTable) {
    fail(`${label} is a comparison page without comparisonTable.`);
  }

  const linkCount = new Set([
    ...page.relatedTools.map((item) => item.href),
    ...page.relatedPages.map((item) => item.href),
    ...page.relatedGuides.map((item) => item.href),
    ...page.relatedHubs.map((item) => item.href),
  ]).size;

  if (page.priority && linkCount < 5) {
    fail(`${label} priority page needs at least 5 internal links, found ${linkCount}.`);
  }

  if (page.priority) {
    if (!page.priorityReason) fail(`${label} missing priorityReason.`);
    if ((page.targetQueries?.length ?? 0) < 5) fail(`${label} needs at least 5 targetQueries.`);
    if ((page.citationReadyFacts?.length ?? 0) < 5) fail(`${label} needs at least 5 citationReadyFacts.`);
    if ((page.answerEnginePromptExamples?.length ?? 0) < 3) fail(`${label} needs at least 3 answerEnginePromptExamples.`);
    if (!page.manualReviewNotes?.length) fail(`${label} missing manualReviewNotes.`);
    if (!page.authorityIntro) fail(`${label} missing authorityIntro.`);
    if ((page.expertWorkflowNotes?.length ?? 0) < 5) fail(`${label} needs at least 5 expertWorkflowNotes.`);
    if ((page.edgeCaseExamples?.length ?? 0) < 5) fail(`${label} needs at least 5 edgeCaseExamples.`);
    if ((page.citationEvidenceNotes?.length ?? 0) < 5) fail(`${label} needs at least 5 citationEvidenceNotes.`);
    if ((page.userIntentVariants?.length ?? 0) < 5) fail(`${label} needs at least 5 userIntentVariants.`);
    if ((page.decisionTree?.length ?? 0) < 5) fail(`${label} needs at least 5 decisionTree entries.`);
    if (!page.finalRecommendation) fail(`${label} missing finalRecommendation.`);

    for (const fact of page.citationReadyFacts ?? []) {
      if (/#1|guaranteed/i.test(fact)) {
        fail(`${label} citationReadyFacts contains unsupported absolute claim: ${fact}`);
      }
    }

    const priorityContentWords = wordCount([
      page.priorityReason,
      page.authorityIntro,
      page.realWorldScenario,
      page.betterAlternative,
      page.finalRecommendation,
      ...(page.targetQueries ?? []),
      ...(page.answerEnginePromptExamples ?? []),
      ...(page.citationReadyFacts ?? []),
      ...(page.citationEvidenceNotes ?? []),
      ...(page.manualReviewNotes ?? []),
      ...(page.decisionChecklist ?? []),
      ...(page.decisionTree ?? []),
      ...(page.expertWorkflowNotes ?? []),
      ...(page.failureCases ?? []),
      ...(page.edgeCaseExamples ?? []),
      ...(page.boundaryNotes ?? []),
      ...(page.userIntentVariants ?? []),
    ].join(" "));

    if (priorityContentWords < 520) {
      fail(`${label} priority content is not substantially expanded, found ${priorityContentWords} words.`);
    }
  }
}

for (const slug of expectedPrioritySlugs) {
  if (!seedBySlug.has(slug)) {
    fail(`Priority slug does not exist in seeds: ${slug}`);
  }
}

if (!fs.existsSync(llmsPath)) {
  fail("public/llms.txt is missing.");
} else {
  const llms = fs.readFileSync(llmsPath, "utf8");
  for (const phrase of [
    "Priority pages for AI citation",
    "PDF compression",
    "OCR and scanned PDFs",
    "AI PDF workflows",
    "PDF workflow comparisons",
    "Industry workflows",
  ]) {
    if (!llms.includes(phrase)) fail(`llms.txt missing phrase: ${phrase}`);
  }
}

if (!fs.existsSync(outSitemapPath)) {
  warn("out/sitemap.xml not found. Run build before export-level sitemap checks.");
} else {
  const sitemap = fs.readFileSync(outSitemapPath, "utf8");
  for (const slug of expectedPrioritySlugs) {
    const seed = seedBySlug.get(slug);
    if (!seed) continue;
    const url = `${siteUrl}${routeFor(seed)}`;
    if (!sitemap.includes(url)) {
      warn(`out/sitemap.xml missing priority URL before rebuild: ${url}`);
    }
  }
}

if (!fs.existsSync(outLlmsPath)) {
  warn("out/llms.txt not found. Run build before export-level llms.txt checks.");
}

if (warnings.length) {
  console.warn("GEO QA warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (failures.length) {
  console.error("GEO QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`GEO QA passed: ${seeds.length} pages checked, ${prioritySeeds.length} priority pages checked.`);

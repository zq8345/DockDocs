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

const geo018HighIntentSlugs = [
  "ai-contract-risk-summary",
  "ai-contract-clause-extraction",
  "ai-contract-obligation-tracker",
  "ai-contract-renewal-date-review",
  "ai-contract-redline-preparation",
  "ai-research-literature-review-workflow",
  "ai-research-methods-summary",
  "ai-research-citation-extraction",
  "ai-research-table-extraction",
  "ai-research-findings-comparison",
  "ai-due-diligence-report-summary",
  "ai-due-diligence-red-flag-review",
  "ai-due-diligence-checklist-pdf",
  "ai-compliance-policy-summary",
  "ai-compliance-evidence-review",
  "ai-compliance-audit-preparation",
  "ai-audit-report-summary",
  "ai-audit-evidence-extraction",
  "ai-audit-findings-review",
  "ai-financial-statement-summary",
  "ai-financial-disclosure-review",
  "ai-financial-risk-notes",
  "ai-knowledge-base-extraction",
  "ai-knowledge-extraction-from-pdf",
  "ai-sop-document-review",
  "ai-policy-document-comparison",
  "ai-policy-change-summary",
  "ai-regulatory-document-review",
  "ai-board-report-summary",
  "ai-executive-brief-from-pdf",
  "ai-project-report-summary",
  "ai-technical-document-qa",
  "ai-product-requirements-review",
  "ai-procurement-document-review",
  "ai-rfp-response-review",
  "ai-vendor-document-review",
  "ai-training-manual-summary",
  "ai-meeting-packet-review",
  "ai-grant-report-summary",
  "ai-case-file-summary",
  "pdf-workflow-for-healthcare-forms",
  "ai-pdf-for-healthcare-medical-record-review",
  "ocr-pdf-for-healthcare-patient-intake-forms",
  "pdf-tools-for-healthcare-clinical-documentation",
  "pdf-workflow-for-healthcare-compliance",
  "pdf-tools-for-healthcare-audits",
  "pdf-tools-for-financial-advisors",
  "pdf-workflow-for-finance-bank-statements",
  "ai-pdf-for-finance-investment-report-review",
  "ocr-pdf-for-finance-statements",
  "pdf-workflow-for-finance-tax-documents",
  "ai-pdf-for-finance-compliance-review",
  "pdf-workflow-for-legal-litigation-documents",
  "ai-pdf-for-legal-contract-clause-review",
  "ocr-pdf-for-legal-exhibits",
  "pdf-tools-for-legal-law-firms",
  "pdf-workflow-for-legal-discovery",
  "ai-pdf-for-legal-brief-summary",
  "pdf-tools-for-education-universities",
  "pdf-workflow-for-education-student-records",
  "ai-pdf-for-education-academic-review",
  "ocr-pdf-for-education-classroom-materials",
  "pdf-workflow-for-education-admissions-documents",
  "ai-pdf-for-education-student-application-review",
  "pdf-tools-for-construction-projects",
  "pdf-workflow-for-construction-blueprint-documents",
  "ai-pdf-for-construction-contract-review",
  "ocr-pdf-for-construction-permits",
  "pdf-workflow-for-construction-site-reporting",
  "pdf-workflow-for-construction-bids",
  "pdf-tools-for-logistics-shipping-documents",
  "pdf-workflow-for-logistics-bill-of-lading",
  "ai-pdf-for-logistics-report-review",
  "ocr-pdf-for-logistics-delivery-receipts",
  "pdf-workflow-for-logistics-supply-chain-documents",
  "pdf-tools-for-manufacturing-quality-control",
  "pdf-workflow-for-manufacturing-sops",
  "ai-pdf-for-manufacturing-inspection-report-review",
  "ocr-pdf-for-manufacturing-production-records",
  "pdf-workflow-for-manufacturing-supplier-documents",
];

const allowedSchemaTypes = new Set(["Article", "TechArticle"]);
const blockedClaimPatterns = [
  /\bguarantee(?:d)?\b/i,
  /\baccurate legal advice\b/i,
  /\blegal advice\b/i,
  /\bfinancial advice\b/i,
  /\bmedical advice\b/i,
  /\bdiagnose\b/i,
  /\bcompliance guaranteed\b/i,
  /\brisk-free\b/i,
  /\bfully compliant\b/i,
  /\bcourt-ready\b/i,
  /\baudit-proof\b/i,
  /\bHIPAA compliant\b/i,
  /\bGDPR compliant\b/i,
  /\breplace lawyer\b/i,
  /\breplace accountant\b/i,
  /\breplace doctor\b/i,
];
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

function flattenClaimText(page) {
  return [
    page.title,
    page.h1,
    page.description,
    page.question,
    page.quickAnswer,
    page.aiAnswerSnippet,
    page.aiCitationSummary,
    page.entityDescription,
    page.answer,
    page.measurableOutcome,
    page.betterAlternative,
    page.finalRecommendation,
    ...(page.bestFor ?? []),
    ...(page.notBestFor ?? []),
    ...(page.decisionCriteria ?? []),
    ...(page.useCases ?? []),
    ...(page.commonMistakes ?? []),
    ...(page.limitations ?? []),
    ...(page.privacyNotes ?? []),
    ...(page.definitions ?? []),
    ...(page.standards ?? []),
    ...(page.fileLimits ?? []),
    ...(page.workflowNotes ?? []),
    ...(page.whenToUseThisWorkflow ?? []),
    ...(page.whenNotToUseThisWorkflow ?? []),
    ...(page.alternativeWorkflows ?? []),
    ...(page.steps ?? []),
    ...(page.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
  ]
    .filter(Boolean)
    .join(" ");
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

  const isGeo018HighIntent = geo018HighIntentSlugs.includes(page.slug);
  const isSensitivePage =
    page.sensitiveDomain !== "general" ||
    page.professionalReviewRequired ||
    page.cluster === "ai-pdf";

  if (isGeo018HighIntent) {
    const claimText = flattenClaimText(page);
    for (const pattern of blockedClaimPatterns) {
      if (pattern.test(claimText)) {
        fail(`${label} contains blocked claim pattern: ${pattern}`);
      }
    }
  }

  if (isSensitivePage) {
    if (!page.claimSafetyNotes?.length) {
      fail(`${label} sensitive/professional-review page missing claimSafetyNotes.`);
    }

    if (!page.privacyNotes?.some((note) => /Review boundaries:/i.test(note))) {
      fail(`${label} sensitive/professional-review page must expose Review boundaries in visible privacy notes.`);
    }
  }

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

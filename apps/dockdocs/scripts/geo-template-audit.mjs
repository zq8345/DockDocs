import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import process from "node:process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const sourcePath = path.join(appRoot, "lib", "programmatic-geo.ts");
const siteUrl = "https://dockdocs.app";

const repeatedWarnings = [];
const report = [];

function normalize(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim()
    .toLowerCase();
}

function display(value, max = 140) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
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

function addMapValue(map, key, route, sample) {
  if (!key) return;
  if (!map.has(key)) map.set(key, { routes: new Set(), sample });
  map.get(key).routes.add(route);
}

function getSentences(values) {
  return values
    .flatMap((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return value.split(/(?<=[.!?])\s+/u);
      return [];
    })
    .map((value) => String(value ?? "").trim())
    .filter((value) => wordCount(value) >= 8);
}

function paragraphOpening(value) {
  const words = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 9);
  return words.length >= 6 ? normalize(words.join(" ")) : "";
}

const geo = loadProgrammaticGeoModule();
const seeds = geo.getProgrammaticGeoPageSeeds();
const prioritySeeds = seeds.filter((seed) => seed.priority);

const exactAiSnippets = new Map();
const exactCitationSummaries = new Map();
const faqAnswers = new Map();
const limitationBlocks = new Map();
const sentencePatterns = new Map();
const paragraphOpenings = new Map();

for (const seed of prioritySeeds) {
  const page = geo.getProgrammaticGeoPage("en", seed.surface, seed.slug);
  if (!page) {
    repeatedWarnings.push(`Missing page data for priority seed: ${seed.slug}`);
    continue;
  }

  const route = routeFor(page);
  const contentValues = [
    page.title,
    page.description,
    page.question,
    page.quickAnswer,
    page.aiAnswerSnippet,
    page.aiCitationSummary,
    page.entityDescription,
    page.priorityReason,
    page.authorityIntro,
    page.realWorldScenario,
    page.betterAlternative,
    page.finalRecommendation,
    page.measurableOutcome,
    page.answer,
    page.targetQueries,
    page.answerEnginePromptExamples,
    page.citationReadyFacts,
    page.manualReviewNotes,
    page.decisionChecklist,
    page.failureCases,
    page.boundaryNotes,
    page.expertWorkflowNotes,
    page.edgeCaseExamples,
    page.citationEvidenceNotes,
    page.userIntentVariants,
    page.decisionTree,
    page.bestFor,
    page.notBestFor,
    page.decisionCriteria,
    page.useCases,
    page.commonMistakes,
    page.limitations,
    page.privacyNotes,
    page.claimSafetyNotes,
    page.definitions,
    page.standards,
    page.fileLimits,
    page.workflowNotes,
    page.whenToUseThisWorkflow,
    page.whenNotToUseThisWorkflow,
    page.alternativeWorkflows,
    page.steps,
    page.faqs?.map((faq) => `${faq.question} ${faq.answer}`),
  ];

  const visibleWords = wordCount(contentValues.flat().join(" "));
  if (visibleWords < 1600) {
    repeatedWarnings.push(`${route} priority content may be thin for human-review goals: ${visibleWords} estimated words.`);
  }

  addMapValue(exactAiSnippets, normalize(page.aiAnswerSnippet), route, page.aiAnswerSnippet);
  addMapValue(exactCitationSummaries, normalize(page.aiCitationSummary), route, page.aiCitationSummary);
  addMapValue(limitationBlocks, normalize((page.limitations ?? []).join(" | ")), route, (page.limitations ?? []).join(" | "));

  for (const faq of page.faqs ?? []) {
    addMapValue(faqAnswers, normalize(faq.answer), route, faq.answer);
  }

  for (const value of [
    page.quickAnswer,
    page.aiAnswerSnippet,
    page.aiCitationSummary,
    page.entityDescription,
    page.priorityReason,
    page.authorityIntro,
    page.realWorldScenario,
    page.finalRecommendation,
  ]) {
    addMapValue(paragraphOpenings, paragraphOpening(value), route, value);
  }

  for (const sentence of getSentences(contentValues)) {
    addMapValue(sentencePatterns, normalize(sentence), route, sentence);
  }
}

function reportDuplicates(label, map, threshold = 2) {
  const duplicates = [...map.entries()]
    .map(([key, value]) => ({ key, ...value, count: value.routes.size }))
    .filter((item) => item.key && item.count >= threshold)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  if (!duplicates.length) {
    report.push(`${label}: no high-risk exact duplicates detected.`);
    return;
  }

  report.push(`${label}: ${duplicates.length} duplicate pattern(s) detected.`);
  for (const item of duplicates) {
    const routes = [...item.routes].slice(0, 6).join(", ");
    report.push(`- ${item.count} pages: "${display(item.sample)}"`);
    report.push(`  Routes: ${routes}${item.count > 6 ? ", ..." : ""}`);
  }
}

report.push(`GEO template audit checked ${seeds.length} total GEO pages and ${prioritySeeds.length} priority pages.`);
report.push("");
reportDuplicates("Identical AI answer snippets", exactAiSnippets);
report.push("");
reportDuplicates("Identical citation summaries", exactCitationSummaries);
report.push("");
reportDuplicates("Duplicate FAQ answers", faqAnswers, 3);
report.push("");
reportDuplicates("Duplicate limitation blocks", limitationBlocks, 3);
report.push("");
reportDuplicates("Repeated paragraph openings", paragraphOpenings, 4);
report.push("");
reportDuplicates("Repeated sentence patterns", sentencePatterns, 5);

if (repeatedWarnings.length) {
  report.push("");
  report.push("Priority page content length warnings:");
  for (const warning of repeatedWarnings) report.push(`- ${warning}`);
}

report.push("");
report.push("GEO template audit completed. This script reports risks only and does not rewrite content.");

console.log(report.join("\n"));

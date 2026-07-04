"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { authHeader } from "@/lib/supabase";
import { trackToolRun } from "@/lib/track";
import { deepHant } from "@/lib/zh-hant";
import { routeLocaleFromSegment } from "@/lib/i18n";
import { extractText, toUnits, diff, changePairs, type Op } from "@/lib/redline-core";
import { LAYOUT } from "@/lib/layout-constants";
import { dropzoneVisual } from "@/components/design";
import type { AuthoredLocale } from "@/lib/i18n";
import { LegalWorkspaceBanner } from "@/components/LegalWorkspaceBanner";
import { WorkArea } from "@/components/WorkArea";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";

type ChangeCard = {
  category: string;
  severity: "high" | "medium" | "low";
  direction: "added" | "removed" | "modified";
  whyItMatters: string;
  negotiationTip: string;
};
type Phase = "idle" | "comparing" | "diff-ready" | "analyzing" | "done";

const SEV_CLS: Record<string, string> = {
  high:   "border-red-500/30 bg-red-500/10 text-red-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  low:    "border-[color:var(--soft-accent)] bg-[color:var(--soft-accent)] text-[color:var(--accent)]",
};
const DIR_CLS: Record<string, string> = {
  added: "text-emerald-400", removed: "text-red-400", modified: "text-amber-400",
};

const STR: Record<AuthoredLocale, {
  title: string; sub: string; v1: string; v2: string; drop: string;
  compareBtn: string; comparing: string; analyzeBtn: string; analyzing: string;
  exportBtn: string; noDiffs: string; tipLabel: string; disclaimer: string;
  additions: string; deletions: string;
  sev: Record<string, string>; dir: Record<string, string>; pairsCapped: string;
  backBtn: string; resetBtn: string; clearFiles: string; genericError: string; pageOne: string;
}> = {
  en: {
    title: "Contract Review", sub: "Upload two versions of a contract to see what changed — then get an AI explanation of each change and why it matters.",
    v1: "Original Contract (V1)", v2: "Revised Contract (V2)", drop: "Drop PDF here, or click to choose",
    compareBtn: "Compare Versions", comparing: "Comparing…",
    analyzeBtn: "Analyze Changes (AI)", analyzing: "Analyzing…",
    exportBtn: "Export CSV", noDiffs: "No differences found between the two versions.",
    tipLabel: "Tip", disclaimer: "Informational only — not legal advice.",
    additions: "additions", deletions: "deletions",
    sev: { high: "High Risk", medium: "Medium", low: "Low" },
    dir: { added: "Added", removed: "Removed", modified: "Modified" },
    pairsCapped: "Analysis covers the first 40 changes.",
    backBtn: "← Back", resetBtn: "↩ Reset", clearFiles: "Clear files", genericError: "Something went wrong. Please try again.", pageOne: "Page 1",
  },
  zh: {
    title: "合同版本对比", sub: "上传合同的两个版本，查看改动内容——并获取 AI 对每条改动及其影响的解析。",
    v1: "原始合同（V1）", v2: "修订版合同（V2）", drop: "将 PDF 拖放至此，或点击选择",
    compareBtn: "对比版本", comparing: "对比中…",
    analyzeBtn: "AI 分析改动", analyzing: "分析中…",
    exportBtn: "导出 CSV", noDiffs: "两个版本之间未发现差异。",
    tipLabel: "建议", disclaimer: "仅供参考，不构成法律意见。",
    additions: "处新增", deletions: "处删除",
    sev: { high: "高风险", medium: "中等", low: "低" },
    dir: { added: "新增", removed: "删除", modified: "修改" },
    pairsCapped: "分析涵盖最多 40 处改动。",
    backBtn: "← 返回", resetBtn: "↩ 重置", clearFiles: "清空文件", genericError: "操作失败，请重试。", pageOne: "第 1 页",
  },
  es: {
    title: "Revisión de contratos", sub: "Sube dos versiones de un contrato para ver qué cambió — luego obtén una explicación de IA de cada cambio.",
    v1: "Contrato original (V1)", v2: "Contrato revisado (V2)", drop: "Arrastra el PDF aquí o haz clic para elegir",
    compareBtn: "Comparar versiones", comparing: "Comparando…",
    analyzeBtn: "Analizar cambios (IA)", analyzing: "Analizando…",
    exportBtn: "Exportar CSV", noDiffs: "No se encontraron diferencias entre las dos versiones.",
    tipLabel: "Consejo", disclaimer: "Solo informativo — no constituye asesoramiento legal.",
    additions: "adiciones", deletions: "eliminaciones",
    sev: { high: "Alto riesgo", medium: "Medio", low: "Bajo" },
    dir: { added: "Añadido", removed: "Eliminado", modified: "Modificado" },
    pairsCapped: "El análisis cubre hasta 40 cambios.",
    backBtn: "← Volver", resetBtn: "↩ Restablecer", clearFiles: "Borrar archivos", genericError: "Algo salió mal. Inténtalo de nuevo.", pageOne: "Página 1",
  },
  pt: {
    title: "Revisão de contratos", sub: "Carregue duas versões de um contrato para ver o que mudou — e obtenha uma explicação de IA para cada alteração.",
    v1: "Contrato original (V1)", v2: "Contrato revisado (V2)", drop: "Arraste o PDF aqui ou clique para escolher",
    compareBtn: "Comparar versões", comparing: "Comparando…",
    analyzeBtn: "Analisar alterações (IA)", analyzing: "Analisando…",
    exportBtn: "Exportar CSV", noDiffs: "Nenhuma diferença encontrada entre as duas versões.",
    tipLabel: "Dica", disclaimer: "Apenas informativo — não constitui aconselhamento jurídico.",
    additions: "adições", deletions: "remoções",
    sev: { high: "Alto risco", medium: "Médio", low: "Baixo" },
    dir: { added: "Adicionado", removed: "Removido", modified: "Modificado" },
    pairsCapped: "A análise cobre até 40 alterações.",
    backBtn: "← Voltar", resetBtn: "↩ Redefinir", clearFiles: "Limpar arquivos", genericError: "Algo deu errado. Tente novamente.", pageOne: "Página 1",
  },
  fr: {
    title: "Révision de contrats", sub: "Téléchargez deux versions d'un contrat pour voir ce qui a changé — puis obtenez une explication IA de chaque modification.",
    v1: "Contrat original (V1)", v2: "Contrat révisé (V2)", drop: "Déposez le PDF ici ou cliquez pour choisir",
    compareBtn: "Comparer les versions", comparing: "Comparaison en cours…",
    analyzeBtn: "Analyser les modifications (IA)", analyzing: "Analyse en cours…",
    exportBtn: "Exporter CSV", noDiffs: "Aucune différence trouvée entre les deux versions.",
    tipLabel: "Conseil", disclaimer: "À titre informatif uniquement — pas de conseil juridique.",
    additions: "ajouts", deletions: "suppressions",
    sev: { high: "Risque élevé", medium: "Moyen", low: "Faible" },
    dir: { added: "Ajouté", removed: "Supprimé", modified: "Modifié" },
    pairsCapped: "L'analyse couvre jusqu'à 40 modifications.",
    backBtn: "← Retour", resetBtn: "↩ Réinitialiser", clearFiles: "Vider la liste", genericError: "Une erreur est survenue. Veuillez réessayer.", pageOne: "Page 1",
  },
  ja: {
    title: "契約書バージョン比較", sub: "契約書の2つのバージョンをアップロードして変更点を確認し、各変更の影響をAIで解説します。",
    v1: "元の契約書（V1）", v2: "改訂版契約書（V2）", drop: "PDFをここにドロップ、またはクリックして選択",
    compareBtn: "バージョンを比較", comparing: "比較中…",
    analyzeBtn: "変更点をAI分析", analyzing: "分析中…",
    exportBtn: "CSVエクスポート", noDiffs: "2つのバージョン間に差異は見つかりませんでした。",
    tipLabel: "アドバイス", disclaimer: "情報提供のみ — 法的アドバイスではありません。",
    additions: "箇所追加", deletions: "箇所削除",
    sev: { high: "高リスク", medium: "中程度", low: "低" },
    dir: { added: "追加", removed: "削除", modified: "変更" },
    pairsCapped: "最大40件の変更を分析します。",
    backBtn: "← 戻る", resetBtn: "↩ リセット", clearFiles: "ファイルをクリア", genericError: "エラーが発生しました。もう一度お試しください。", pageOne: "1ページ目",
  },
  de: {
    title: "Vertragsversionsvergleich", sub: "Laden Sie zwei Vertragsversionen hoch, um Änderungen zu sehen — und erhalten Sie KI-Erklärungen zu jeder Änderung.",
    v1: "Originalvertrag (V1)", v2: "Überarbeiteter Vertrag (V2)", drop: "PDF hier ablegen oder klicken, um zu wählen",
    compareBtn: "Versionen vergleichen", comparing: "Vergleiche…",
    analyzeBtn: "Änderungen analysieren (KI)", analyzing: "Analysiere…",
    exportBtn: "CSV exportieren", noDiffs: "Keine Unterschiede zwischen den beiden Versionen gefunden.",
    tipLabel: "Tipp", disclaimer: "Nur zu Informationszwecken — keine Rechtsberatung.",
    additions: "Ergänzungen", deletions: "Löschungen",
    sev: { high: "Hohes Risiko", medium: "Mittel", low: "Niedrig" },
    dir: { added: "Hinzugefügt", removed: "Entfernt", modified: "Geändert" },
    pairsCapped: "Die Analyse umfasst bis zu 40 Änderungen.",
    backBtn: "← Zurück", resetBtn: "↩ Zurücksetzen", clearFiles: "Liste leeren", genericError: "Etwas ist schiefgelaufen. Bitte erneut versuchen.", pageOne: "Seite 1",
  },
  ko: {
    title: "계약서 버전 비교", sub: "계약서의 두 버전을 업로드하여 변경된 내용을 확인하고 AI로 각 변경의 의미를 파악하세요.",
    v1: "원본 계약서 (V1)", v2: "수정 계약서 (V2)", drop: "PDF를 여기에 끌어놓거나 클릭하여 선택",
    compareBtn: "버전 비교", comparing: "비교 중…",
    analyzeBtn: "변경 사항 AI 분석", analyzing: "분석 중…",
    exportBtn: "CSV 내보내기", noDiffs: "두 버전 간 차이가 없습니다.",
    tipLabel: "팁", disclaimer: "정보 제공 목적만 — 법률 자문이 아닙니다.",
    additions: "추가", deletions: "삭제",
    sev: { high: "고위험", medium: "중간", low: "낮음" },
    dir: { added: "추가됨", removed: "삭제됨", modified: "변경됨" },
    pairsCapped: "최대 40개 변경 사항을 분석합니다.",
    backBtn: "← 뒤로", resetBtn: "↩ 초기화", clearFiles: "파일 비우기", genericError: "오류가 발생했습니다. 다시 시도해 주세요.", pageOne: "1페이지",
  },
};

function opsStats(ops: Op[]) {
  const ins = ops.filter((o) => o.type === "ins").length;
  const del = ops.filter((o) => o.type === "del").length;
  return { ins, del };
}

function toHunks(ops: Op[]) {
  const out: { del: string; ins: string }[] = [];
  let i = 0;
  while (i < ops.length) {
    if (ops[i].type === "del") {
      if (ops[i + 1]?.type === "ins") { out.push({ del: ops[i].text, ins: ops[i + 1].text }); i += 2; }
      else { out.push({ del: ops[i].text, ins: "" }); i++; }
    } else if (ops[i].type === "ins") {
      out.push({ del: "", ins: ops[i].text }); i++;
    } else { i++; }
  }
  return out;
}

function FileSlot({
  label, file, onFile, dragging, onDragOver, onDrop, onDragLeave, inputRef, disabled, altThumb,
}: {
  label: string; file: File | null; onFile: (f: File) => void;
  dragging: boolean; onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void; onDragLeave: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>; disabled?: boolean; altThumb?: string;
}) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [pages, setPages] = useState<number | null>(null);
  useEffect(() => {
    if (!file) { setThumb(null); setPages(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        if (!cancelled) setPages(doc.numPages);
        const page = await doc.getPage(1);
        const vp = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
        if (!cancelled) setThumb(canvas.toDataURL("image/jpeg", 0.7));
        doc.destroy();
      } catch { /* non-critical */ }
    })();
    return () => { cancelled = true; };
  }, [file]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]" : "border-[color:var(--line)] bg-[color:var(--surface-subtle)] hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"} ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {file ? (
        /* Preview-card standard: square contain frame on a neutral ground,
           name · size · pages stacked BELOW the image (was a small thumb
           with text beside it). Clicking still swaps the file. */
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)]">
            {thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt={altThumb ?? "Page 1"} className="max-h-full max-w-full object-contain" />
            )}
          </div>
          <div className="min-w-0 text-center">
            <p className="max-w-[220px] truncate text-[13px] font-medium text-[color:var(--foreground)]">{file.name}</p>
            <p className="mt-0.5 text-[11px] text-[color:var(--faint)]">
              {(file.size / 1024 / 1024).toFixed(2)} MB{pages != null ? ` · ${pages}p` : ""}
            </p>
          </div>
        </div>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[color:var(--faint)]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span className="text-[12px] text-[color:var(--muted)]">{label}</span>
        </>
      )}
    </div>
  );
}

export function ContractReviewClient() {
  const pathname = usePathname();
  const routeLocale = routeLocaleFromSegment(pathname?.split("/").filter(Boolean)[0]);
  const isHant = routeLocale === "zh-Hant";
  const locale = (isHant ? "zh" : routeLocale) as AuthoredLocale;
  const s = STR[locale] ?? STR.en;
  const T = useCallback((t: string) => (isHant ? deepHant(t) : t), [isHant]);

  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [dragA, setDragA] = useState(false);
  const [dragB, setDragB] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [ops, setOps] = useState<Op[]>([]);
  const [changes, setChanges] = useState<ChangeCard[]>([]);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeLimit, setUpgradeLimit] = useState(0);
  const refA = useRef<HTMLInputElement>(null);
  const refB = useRef<HTMLInputElement>(null);

  const ready = !!fileA && !!fileB && phase === "idle";
  const diffReady = phase === "diff-ready" || phase === "analyzing" || phase === "done";

  async function handleCompare() {
    if (!fileA || !fileB) return;
    setPhase("comparing");
    setError("");
    try {
      const [tA, tB] = await Promise.all([extractText(fileA), extractText(fileB)]);
      const result = diff(toUnits(tA), toUnits(tB));
      setOps(result);
      setPhase("diff-ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : s.genericError);
      setPhase("idle");
    }
  }

  async function handleAnalyze() {
    const gate = await checkUsage("contractAnalyzer");
    if (!gate.allowed) { setUpgradeLimit(gate.limit); setShowUpgrade(true); return; }

    setPhase("analyzing");
    setError("");
    const pairs = changePairs(ops)
      .filter((p) => (p.del.trim().length + p.ins.trim().length) > 10)
      .slice(0, 40);

    try {
      const auth = await authHeader();
      const res = await fetch("/api/contract-changes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ pairs, locale }),
      });
      const data: { ok: boolean; changes?: ChangeCard[]; message?: string } = await res.json();
      if (!data.ok) throw new Error(data.message || s.genericError);
      await markUsage(gate, "contractAnalyzer");
      trackToolRun("contract-review");
      setChanges(data.changes ?? []);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : s.genericError);
      setPhase("diff-ready");
    }
  }

  function handleExportCSV() {
    const header = ["Category", "Direction", "Severity", "Why It Matters", "Tip"].join(",");
    const rows = changes.map((c) =>
      [
        `"${c.category}"`,
        `"${c.direction}"`,
        `"${c.severity}"`,
        `"${c.whyItMatters.replace(/"/g, '""')}"`,
        `"${(c.negotiationTip || "").replace(/"/g, '""')}"`,
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contract-changes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function makeDragHandlers(slot: "a" | "b") {
    const setDrag = slot === "a" ? setDragA : setDragB;
    return {
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDrag(true); },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f?.type === "application/pdf") (slot === "a" ? setFileA : setFileB)(f);
      },
      onDragLeave: () => setDrag(false),
    };
  }

  const stats = diffReady ? opsStats(ops) : null;
  const hunks = diffReady ? toHunks(ops).slice(0, 150) : [];

  if (showUpgrade) return (
    <div className={`mx-auto ${LAYOUT.content} px-5 py-12 sm:px-6 lg:px-8`}>
      <button onClick={() => setShowUpgrade(false)} className="mb-4 text-[13px] text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{T(s.backBtn)}</button>
      <UpgradePrompt locale={locale} limit={upgradeLimit} />
    </div>
  );

  return (
    <div className={`mx-auto ${LAYOUT.content} px-5 py-12 sm:px-6 lg:px-8`}>
      {/* Header */}
      <div className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--faint)]">PRO</span>
        <h1 className="mt-1 text-[32px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[40px]">
          {T(s.title)}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-[color:var(--muted)]">{T(s.sub)}</p>
      </div>

      <LegalWorkspaceBanner />

      {/* Upload work area — revised slot standard: clear-files by the count
          side (left), primary CTA on the right. Analysis/result regions below
          are untouched (AI-shell batch owns those). */}
      {phase === "idle" && (
        <WorkArea
          left={
            <button
              type="button"
              onClick={() => { setFileA(null); setFileB(null); setError(""); }}
              disabled={!fileA && !fileB}
              className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-35 disabled:hover:border-[color:var(--line)]"
            >
              {T(s.clearFiles)}
            </button>
          }
          right={
            <button
              type="button"
              disabled={!ready}
              onClick={handleCompare}
              className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {T(s.compareBtn)}
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[12px] font-semibold text-[color:var(--muted)]">{T(s.v1)}</p>
              <FileSlot label={T(s.drop)} file={fileA} onFile={setFileA} dragging={dragA} {...makeDragHandlers("a")} inputRef={refA} altThumb={T(s.pageOne)} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-semibold text-[color:var(--muted)]">{T(s.v2)}</p>
              <FileSlot label={T(s.drop)} file={fileB} onFile={setFileB} dragging={dragB} {...makeDragHandlers("b")} inputRef={refB} altThumb={T(s.pageOne)} />
            </div>
          </div>
        </WorkArea>
      )}

      {/* Show file names + reset in non-idle phases */}
      {phase !== "idle" && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded border border-[color:var(--line)] px-2.5 py-1 text-[12px] text-[color:var(--muted)]">
            V1: {fileA?.name}
          </span>
          <span className="rounded border border-[color:var(--line)] px-2.5 py-1 text-[12px] text-[color:var(--muted)]">
            V2: {fileB?.name}
          </span>
          {phase !== "comparing" && phase !== "analyzing" && (
            <button
              onClick={() => { setFileA(null); setFileB(null); setPhase("idle"); setOps([]); setChanges([]); setError(""); }}
              className="ml-auto text-[12px] text-[color:var(--muted)] underline underline-offset-2 hover:text-[color:var(--foreground)]"
            >
              {T(s.resetBtn)}
            </button>
          )}
        </div>
      )}

      {/* Comparing spinner */}
      {phase === "comparing" && (
        <div className="flex items-center gap-3 py-8 text-[color:var(--muted)]">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-18 0"/></svg>
          <span className="text-[14px]">{T(s.comparing)}</span>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</p>
      )}

      {/* Diff view */}
      {diffReady && (
        <div className="mt-2">
          {stats && (
            <div className="mb-4 flex flex-wrap items-center gap-4 text-[13px]">
              <span className="text-emerald-400">+{stats.ins} {T(s.additions)}</span>
              <span className="text-red-400">−{stats.del} {T(s.deletions)}</span>
              {phase === "done" && changes.length > 0 && (
                <span className="text-[color:var(--faint)]">{T(s.pairsCapped)}</span>
              )}
            </div>
          )}

          {hunks.length === 0 ? (
            <p className="text-[14px] text-[color:var(--muted)]">{T(s.noDiffs)}</p>
          ) : (
            <div className="max-h-[360px] overflow-y-auto rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
              <div className="space-y-3">
                {hunks.map((h, i) => (
                  <div key={i} className="rounded-lg border border-[color:var(--line)] overflow-hidden text-[12px] leading-[1.6] font-mono">
                    {h.del && (
                      <div className="border-b border-red-500/20 bg-red-500/8 px-3 py-2 text-red-300 line-through decoration-red-400/60">
                        {h.del}
                      </div>
                    )}
                    {h.ins && (
                      <div className="bg-emerald-500/8 px-3 py-2 text-emerald-300">
                        {h.ins}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action row */}
          {(phase === "diff-ready" || phase === "done") && hunks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {phase === "diff-ready" && (
                <button
                  onClick={handleAnalyze}
                  className="rounded-lg bg-[color:var(--accent)] px-5 py-2.5 text-[13px] font-medium text-[color:var(--on-accent)] transition hover:opacity-90"
                >
                  {T(s.analyzeBtn)}
                </button>
              )}
              {phase === "done" && changes.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="rounded-lg border border-[color:var(--line)] px-4 py-2.5 text-[13px] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {T(s.exportBtn)}
                </button>
              )}
            </div>
          )}

          {phase === "analyzing" && (
            <div className="mt-4 flex items-center gap-3 text-[color:var(--muted)]">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-18 0"/></svg>
              <span className="text-[13px]">{T(s.analyzing)}</span>
            </div>
          )}
        </div>
      )}

      {/* Change cards */}
      {phase === "done" && changes.length > 0 && (
        <div className="mt-8 space-y-3">
          {(["high", "medium", "low"] as const).map((sev) => {
            const group = changes.filter((c) => c.severity === sev);
            if (!group.length) return null;
            return (
              <div key={sev}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">
                  {T(s.sev[sev])}
                </p>
                <div className="space-y-2">
                  {group.map((c, i) => (
                    <div key={i} className={`rounded-xl border px-4 py-3 ${SEV_CLS[sev]}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] bg-black/20">
                          {c.category}
                        </span>
                        <span className={`text-[11px] font-medium ${DIR_CLS[c.direction]}`}>
                          {T(s.dir[c.direction])}
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.5]">{T(c.whyItMatters)}</p>
                      {c.negotiationTip && (
                        <p className="mt-1.5 text-[12px] opacity-70">
                          <span className="font-semibold">{T(s.tipLabel)}: </span>{T(c.negotiationTip)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="pt-2 text-[11px] text-[color:var(--faint)]">{T(s.disclaimer)}</p>
        </div>
      )}
      <ToolBridge slug="contract-review" locale={locale} useLocalePrefix={locale !== "en"} />
    </div>
  );
}

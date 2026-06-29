"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { loadTemplates, saveTemplate, deleteTemplate, type FlowTemplate } from "@/lib/flow-templates";
import { loadRunsForTemplate, saveRun, relativeTime, type FlowRun } from "@/lib/flow-runs";
import { isEncryptedPdfError, encryptedPdfNotice } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { trackToolRun } from "@/lib/track";
import { dropzoneShell } from "@/components/design";
import { formatBytes } from "@/lib/files";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { deepHant, toHant } from "@/lib/zh-hant";
import { WorkspaceValueZone } from "@/components/WorkspaceValueZone";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";

// Comparison engine UI (bilingual).
//  D5: multi-file upload -> browser-side text extraction (pdf.js).
//  D6: /api/compare-extract -> aligned structured fields with sources -> table.

// Canonical: derive from RouteLocale so adding a route locale without copy is a tsc error.
type Locale = RouteLocale;
// Base locales that have authored copy tables; zh-Hant is derived from zh via deepHant.
type BaseLocale = AuthoredLocale;
type DocStatus = "ok" | "empty" | "error";

type DocResult = {
  id: string;
  name: string;
  pages: number;
  chars: number;
  text: string;
  status: DocStatus;
  error?: string;
  file?: File; // kept so a scanned doc can be re-read with OCR
};

type CmpField = { value: string | null; source: string | null };
type CmpDoc = { id: string; name: string; fields: Record<string, CmpField> };
type Comparison = {
  docType: string;
  dimensions: Array<{ key: string; label: string }>;
  documents: CmpDoc[];
};

type Recommendation = {
  winnerId: string | null;
  headline: string;
  reasons: string[];
  perDoc: Array<{ id: string; pros: string[]; cons: string[] }>;
};

const MAX_FILES = 8;

const STR = {
  en: {
    badge: "Comparison engine",
    h1: "Compare documents",
    intro: `Upload 2–${MAX_FILES} PDFs of the same kind. DockDocs reads them in your browser, then lines up the key terms side by side — with the source line shown wherever it can be located.`,
    drop: "Drag & drop PDFs here",
    dropHint: "Read locally — your files never leave your device. Field extraction runs on our server.",
    choose: "Choose PDFs",
    samples: "Try 3 sample quotes",
    extracting: "Extracting text…",
    typeLabel: "Type",
    compare: "Compare fields",
    comparing: "Comparing…",
    clear: "Clear",
    bExtracted: "Text extracted",
    bEmpty: "Not recognized (likely scanned — needs OCR)",
    ocrRun: "Extract text with OCR",
    ocrBusy: "Reading with OCR… (this can take a few seconds)",
    bError: "Failed to read",
    needTwo: "Add at least 2 readable documents to compare.",
    failed: "Comparison failed.",
    comparison: "Comparison",
    dimension: "Dimension",
    notRecognized: "Not recognized",
    tableNote:
      "Extracted by AI. Each value shows the exact source line it came from (verified to appear in that document). “Not recognized” means the document didn’t state it — nothing is guessed.",
    comingNext: "Coming next",
    next: [
      "A recommendation backed by the compared numbers (which option wins, and why)",
      "Click any value to jump to the exact spot in the original PDF",
      "Add your own dimensions to compare",
    ],
    docCount: (n: number) => `${n} document${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} page${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} characters`,
    docTypes: [
      { value: "quote", label: "Quotes" },
      { value: "invoice", label: "Invoices" },
      { value: "contract", label: "Contracts" },
    ],
    tplSave: "Save as template",
    tplSaving: "Saving…",
    tplNamePlaceholder: "Template name (e.g. Vendor quotes)",
    tplConfirm: "Save",
    tplCancel: "Cancel",
    tplMyTemplates: "My templates",
    tplDelete: "Delete",
    tplLoaded: (name: string) => `Template: ${name}`,
    tplRerunHint: "Drop new files to re-run automatically",
    tplLastRun: "Last run",
    tplRunFiles: (n: number) => `${n} file${n > 1 ? "s" : ""}`,
    tplNoRuns: "No runs yet",
    tplEditDims: "Edit dimensions",
    tplDimLabel: "Label",
    tplDimAdd: "+ Add",
    tplDimApply: "Apply",
    tplDimReset: "Reset to default",
    tplNewFiles: "New files",
    tplDims: "dims",
    tplDropHere: "Drop PDFs to rerun",
    retry: "Try again",
  },
  zh: {
    badge: "对比引擎",
    h1: "多文档对比",
    intro: `上传 2–${MAX_FILES} 份同类 PDF。DockDocs 在你浏览器里读取，把关键条款并排列出——可定位时在值后面给出原文出处。`,
    drop: "把 PDF 拖到这里",
    dropHint: "在本地读取——文件不离开你的设备。字段抽取在我们服务器上完成。",
    choose: "选择 PDF",
    samples: "试用 3 份示例报价单",
    extracting: "正在抽取文本…",
    typeLabel: "类型",
    compare: "对比字段",
    comparing: "对比中…",
    clear: "清空",
    bExtracted: "已抽取文本",
    bEmpty: "未识别(可能是扫描件——需 OCR)",
    ocrRun: "用 OCR 提取文字",
    ocrBusy: "OCR 识别中…(可能需要几秒)",
    bError: "读取失败",
    needTwo: "至少添加 2 份可读文档才能对比。",
    failed: "对比失败。",
    comparison: "对比结果",
    dimension: "维度",
    notRecognized: "未识别",
    tableNote:
      "由 AI 抽取。每个值都标注了它来自原文的那一句(已校验确实出现在该文档中)。「未识别」表示该文档没有写，绝不猜测。",
    comingNext: "即将推出",
    next: [
      "带依据的推荐(选哪个、为什么)",
      "点任意值，跳转到原 PDF 的对应位置",
      "自定义你要对比的维度",
    ],
    docCount: (n: number) => `${n} 份文档`,
    pages: (n: number) => `${n} 页 · `,
    chars: (n: number) => `${n.toLocaleString()} 字符`,
    docTypes: [
      { value: "quote", label: "报价单" },
      { value: "invoice", label: "账单" },
      { value: "contract", label: "合同" },
    ],
    tplSave: "保存为模板",
    tplSaving: "保存中…",
    tplNamePlaceholder: "模板名称（如：供应商报价单）",
    tplConfirm: "保存",
    tplCancel: "取消",
    tplMyTemplates: "我的模板",
    tplDelete: "删除",
    tplLoaded: (name: string) => `模板：${name}`,
    tplRerunHint: "拖入新文件即自动重跑对比",
    tplLastRun: "最近运行",
    tplRunFiles: (n: number) => `${n} 份文件`,
    tplNoRuns: "暂无运行记录",
    tplEditDims: "编辑维度",
    tplDimLabel: "标签",
    tplDimAdd: "+ 添加",
    tplDimApply: "应用",
    tplDimReset: "恢复默认",
    tplNewFiles: "新文件",
    tplDims: "个维度",
    tplDropHere: "拖入 PDF 即重跑",
    retry: "重试",
  },
  es: {
    badge: "Motor de comparación",
    h1: "Comparar documentos",
    intro: `Sube de 2 a ${MAX_FILES} PDF del mismo tipo. DockDocs los lee en tu navegador y luego alinea los términos clave uno al lado del otro, con la línea de origen detrás de cada valor cuando puede localizarla.`,
    drop: "Arrastra y suelta PDF aquí",
    dropHint: "Se leen localmente: tus archivos nunca salen de tu dispositivo. La extracción de campos se ejecuta en nuestro servidor.",
    choose: "Elegir PDF",
    samples: "Probar 3 cotizaciones de ejemplo",
    extracting: "Extrayendo texto…",
    typeLabel: "Tipo",
    compare: "Comparar campos",
    comparing: "Comparando…",
    clear: "Limpiar",
    bExtracted: "Texto extraído",
    bEmpty: "No reconocido (probablemente escaneado: necesita OCR)",
    ocrRun: "Extraer texto con OCR",
    ocrBusy: "Leyendo con OCR… (esto puede tardar unos segundos)",
    bError: "Error al leer",
    needTwo: "Agrega al menos 2 documentos legibles para comparar.",
    failed: "La comparación falló.",
    comparison: "Comparación",
    dimension: "Dimensión",
    notRecognized: "No reconocido",
    tableNote:
      "Extraído por IA. Cada valor muestra la línea de origen exacta de la que proviene (verificada que aparece en ese documento). “No reconocido” significa que el documento no lo indicaba: no se adivina nada.",
    comingNext: "Próximamente",
    next: [
      "Una recomendación basada en los datos comparados (qué opción gana y por qué)",
      "Haz clic en cualquier valor para saltar al punto exacto en el PDF original",
      "Agrega tus propias dimensiones para comparar",
    ],
    docCount: (n: number) => `${n} documento${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} página${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} caracteres`,
    docTypes: [
      { value: "quote", label: "Cotizaciones" },
      { value: "invoice", label: "Facturas" },
      { value: "contract", label: "Contratos" },
    ],
    tplSave: "Guardar como plantilla",
    tplSaving: "Guardando…",
    tplNamePlaceholder: "Nombre de plantilla (ej. Cotizaciones de proveedores)",
    tplConfirm: "Guardar",
    tplCancel: "Cancelar",
    tplMyTemplates: "Mis plantillas",
    tplDelete: "Eliminar",
    tplLoaded: (name: string) => `Plantilla: ${name}`,
    tplRerunHint: "Suelta archivos nuevos para volver a comparar automáticamente",
    tplLastRun: "Última ejecución",
    tplRunFiles: (n: number) => `${n} archivo${n > 1 ? "s" : ""}`,
    tplNoRuns: "Sin ejecuciones aún",
    tplEditDims: "Editar dimensiones",
    tplDimLabel: "Etiqueta",
    tplDimAdd: "+ Agregar",
    tplDimApply: "Aplicar",
    tplDimReset: "Restaurar predeterminado",
    tplNewFiles: "Archivos nuevos",
    tplDims: "dims.",
    tplDropHere: "Suelta PDFs para volver a ejecutar",
    retry: "Reintentar",
  },
  pt: {
    badge: "Motor de comparação",
    h1: "Comparar documentos",
    intro: `Envie de 2 a ${MAX_FILES} PDFs do mesmo tipo. O DockDocs os lê no seu navegador e alinha os termos-chave lado a lado — com a linha de origem por trás de cada valor quando consegue localizá-la.`,
    drop: "Arraste e solte PDFs aqui",
    dropHint: "Lidos localmente: seus arquivos nunca saem do seu dispositivo. A extração de campos é executada no nosso servidor.",
    choose: "Escolher PDFs",
    samples: "Experimentar 3 orçamentos de exemplo",
    extracting: "Extraindo texto…",
    typeLabel: "Tipo",
    compare: "Comparar campos",
    comparing: "Comparando…",
    clear: "Limpar",
    bExtracted: "Texto extraído",
    bEmpty: "Não reconhecido (provavelmente digitalizado: precisa de OCR)",
    ocrRun: "Extrair texto com OCR",
    ocrBusy: "Lendo com OCR… (pode levar alguns segundos)",
    bError: "Erro ao ler",
    needTwo: "Adicione pelo menos 2 documentos legíveis para comparar.",
    failed: "A comparação falhou.",
    comparison: "Comparação",
    dimension: "Dimensão",
    notRecognized: "Não reconhecido",
    tableNote:
      "Extraído por IA. Cada valor mostra a linha de origem exata de onde veio (verificada como presente nesse documento). \"Não reconhecido\" significa que o documento não o indicava — nada é inventado.",
    comingNext: "Em breve",
    next: [
      "Uma recomendação baseada nos dados comparados (qual opção vence e por quê)",
      "Clique em qualquer valor para ir ao ponto exato no PDF original",
      "Adicione suas próprias dimensões para comparar",
    ],
    docCount: (n: number) => `${n} documento${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} página${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} caracteres`,
    docTypes: [
      { value: "quote", label: "Orçamentos" },
      { value: "invoice", label: "Faturas" },
      { value: "contract", label: "Contratos" },
    ],
    tplSave: "Salvar como modelo",
    tplSaving: "Salvando…",
    tplNamePlaceholder: "Nome do modelo (ex.: Orçamentos de fornecedores)",
    tplConfirm: "Salvar",
    tplCancel: "Cancelar",
    tplMyTemplates: "Meus modelos",
    tplDelete: "Excluir",
    tplLoaded: (name: string) => `Modelo: ${name}`,
    tplRerunHint: "Solte novos arquivos para recomparar automaticamente",
    tplLastRun: "Última execução",
    tplRunFiles: (n: number) => `${n} arquivo${n > 1 ? "s" : ""}`,
    tplNoRuns: "Nenhuma execução ainda",
    tplEditDims: "Editar dimensões",
    tplDimLabel: "Rótulo",
    tplDimAdd: "+ Adicionar",
    tplDimApply: "Aplicar",
    tplDimReset: "Restaurar padrão",
    tplNewFiles: "Novos arquivos",
    tplDims: "dims.",
    tplDropHere: "Solte PDFs para reexecutar",
    retry: "Tentar novamente",
  },
  fr: {
    badge: "Moteur de comparaison · bêta",
    h1: "Comparer des documents",
    intro: `Déposez 2 à ${MAX_FILES} PDF du même type. DockDocs les lit dans votre navigateur, puis aligne les termes clés côte à côte — avec la ligne source derrière chaque valeur lorsqu'elle peut être localisée.`,
    drop: "Glissez-déposez vos PDF ici",
    dropHint: "Lecture locale — vos fichiers ne quittent jamais votre appareil. L'extraction des champs s'effectue sur notre serveur.",
    choose: "Choisir des PDF",
    samples: "Tester 3 devis exemples",
    extracting: "Extraction du texte…",
    typeLabel: "Type",
    compare: "Comparer les champs",
    comparing: "Comparaison en cours…",
    clear: "Effacer",
    bExtracted: "Texte extrait",
    bEmpty: "Non reconnu (probablement scanné — nécessite l'OCR)",
    ocrRun: "Extraire le texte avec l'OCR",
    ocrBusy: "Lecture par OCR… (cela peut prendre quelques secondes)",
    bError: "Échec de la lecture",
    needTwo: "Ajoutez au moins 2 documents lisibles pour lancer la comparaison.",
    failed: "La comparaison a échoué.",
    comparison: "Comparaison",
    dimension: "Dimension",
    notRecognized: "Non reconnu",
    tableNote:
      "Extrait par IA. Chaque valeur affiche la ligne source exacte dont elle provient (vérifiée comme présente dans ce document). « Non reconnu » signifie que le document ne le mentionne pas — rien n'est deviné.",
    comingNext: "Prochainement",
    next: [
      "Une recommandation fondée sur les chiffres comparés (quelle option l'emporte et pourquoi)",
      "Cliquez sur une valeur pour accéder à l'emplacement exact dans le PDF original",
      "Ajoutez vos propres dimensions à comparer",
    ],
    docCount: (n: number) => `${n} document${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} page${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} caractères`,
    docTypes: [
      { value: "quote", label: "Devis" },
      { value: "invoice", label: "Factures" },
      { value: "contract", label: "Contrats" },
    ],
    tplSave: "Enregistrer comme modèle",
    tplSaving: "Enregistrement…",
    tplNamePlaceholder: "Nom du modèle (ex. Devis fournisseurs)",
    tplConfirm: "Enregistrer",
    tplCancel: "Annuler",
    tplMyTemplates: "Mes modèles",
    tplDelete: "Supprimer",
    tplLoaded: (name: string) => `Modèle : ${name}`,
    tplRerunHint: "Déposez de nouveaux fichiers pour relancer la comparaison automatiquement",
    tplLastRun: "Dernière exécution",
    tplRunFiles: (n: number) => `${n} fichier${n > 1 ? "s" : ""}`,
    tplNoRuns: "Aucune exécution pour le moment",
    tplEditDims: "Modifier les dimensions",
    tplDimLabel: "Libellé",
    tplDimAdd: "+ Ajouter",
    tplDimApply: "Appliquer",
    tplDimReset: "Rétablir les valeurs par défaut",
    tplNewFiles: "Nouveaux fichiers",
    tplDims: "dims.",
    tplDropHere: "Déposez des PDF pour relancer",
    retry: "Réessayer",
  },
  ja: {
    badge: "比較エンジン",
    h1: "ドキュメントを比較",
    intro: `同じ種類の PDF を 2〜${MAX_FILES} 件アップロードしてください。DockDocs がブラウザ内で読み取り、主要な項目を横並びで整理します — 出典を特定できた値には原文の一文を表示します。`,
    drop: "ここに PDF をドラッグ＆ドロップ",
    dropHint: "ローカルで読み取り — ファイルがデバイスから出ることはありません。項目の抽出は当社サーバーで実行されます。",
    choose: "PDF を選択",
    samples: "3 件のサンプル見積もりを試す",
    extracting: "テキストを抽出中…",
    typeLabel: "種類",
    compare: "項目を比較",
    comparing: "比較中…",
    clear: "クリア",
    bExtracted: "テキストを抽出しました",
    bEmpty: "認識できません（スキャンの可能性 — OCR が必要）",
    ocrRun: "OCR でテキストを抽出",
    ocrBusy: "OCR で読み取り中…（数秒かかることがあります）",
    bError: "読み取りに失敗しました",
    needTwo: "比較するには、読み取り可能なドキュメントを 2 件以上追加してください。",
    failed: "比較に失敗しました。",
    comparison: "比較結果",
    dimension: "項目",
    notRecognized: "認識できません",
    tableNote:
      "AI によって抽出されました。各値には、それが由来する出典の一文（その文書に実際に出現することを確認済み）が表示されます。「認識できません」は、その文書に記載がなかったことを意味します — 推測は一切行いません。",
    comingNext: "近日公開",
    next: [
      "比較した数値に基づくおすすめ（どの選択肢が優れているか、その理由）",
      "値をクリックすると、元の PDF の該当箇所へジャンプ",
      "比較したい項目を自分で追加",
    ],
    docCount: (n: number) => `${n} 件のドキュメント`,
    pages: (n: number) => `${n} ページ · `,
    chars: (n: number) => `${n.toLocaleString()} 文字`,
    docTypes: [
      { value: "quote", label: "見積もり" },
      { value: "invoice", label: "請求書" },
      { value: "contract", label: "契約書" },
    ],
    tplSave: "テンプレートとして保存",
    tplSaving: "保存中…",
    tplNamePlaceholder: "テンプレート名（例：取引先の見積もり）",
    tplConfirm: "保存",
    tplCancel: "キャンセル",
    tplMyTemplates: "マイテンプレート",
    tplDelete: "削除",
    tplLoaded: (name: string) => `テンプレート：${name}`,
    tplRerunHint: "新しいファイルをドロップすると自動で再実行されます",
    tplLastRun: "最終実行",
    tplRunFiles: (n: number) => `${n} 件のファイル`,
    tplNoRuns: "実行履歴はまだありません",
    tplEditDims: "項目を編集",
    tplDimLabel: "ラベル",
    tplDimAdd: "+ 追加",
    tplDimApply: "適用",
    tplDimReset: "デフォルトに戻す",
    tplNewFiles: "新しいファイル",
    tplDims: "項目",
    tplDropHere: "PDF をドロップして再実行",
    retry: "再試行",
  },
  de: {
    badge: "Vergleichs-Engine",
    h1: "Dokumente vergleichen",
    intro: `Laden Sie 2–${MAX_FILES} PDFs derselben Art hoch. DockDocs liest sie in Ihrem Browser und stellt die wichtigsten Angaben nebeneinander – mit der Quellzeile, sofern sie sich finden lässt.`,
    drop: "PDFs hierher ziehen und ablegen",
    dropHint: "Lokal gelesen – Ihre Dateien verlassen Ihr Gerät nicht. Die Feldextraktion läuft auf unserem Server.",
    choose: "PDFs auswählen",
    samples: "3 Beispielangebote ausprobieren",
    extracting: "Text wird extrahiert…",
    typeLabel: "Art",
    compare: "Felder vergleichen",
    comparing: "Wird verglichen…",
    clear: "Leeren",
    bExtracted: "Text extrahiert",
    bEmpty: "Nicht erkannt (vermutlich gescannt – OCR erforderlich)",
    ocrRun: "Text mit OCR extrahieren",
    ocrBusy: "Wird mit OCR gelesen… (das kann einige Sekunden dauern)",
    bError: "Lesen fehlgeschlagen",
    needTwo: "Fügen Sie mindestens 2 lesbare Dokumente zum Vergleichen hinzu.",
    failed: "Vergleich fehlgeschlagen.",
    comparison: "Vergleich",
    dimension: "Merkmal",
    notRecognized: "Nicht erkannt",
    tableNote:
      "Von der KI extrahiert. Jeder Wert zeigt die genaue Quellzeile, aus der er stammt (es wurde geprüft, dass sie in diesem Dokument vorkommt). „Nicht erkannt“ bedeutet, dass das Dokument dazu nichts angibt – nichts wird geraten.",
    comingNext: "Demnächst",
    next: [
      "Eine Empfehlung, gestützt auf die verglichenen Zahlen (welche Option gewinnt und warum)",
      "Auf einen beliebigen Wert klicken, um zur genauen Stelle im Original-PDF zu springen",
      "Eigene Merkmale zum Vergleichen hinzufügen",
    ],
    docCount: (n: number) => `${n} ${n === 1 ? "Dokument" : "Dokumente"}`,
    pages: (n: number) => `${n} ${n === 1 ? "Seite" : "Seiten"} · `,
    chars: (n: number) => `${n.toLocaleString()} Zeichen`,
    docTypes: [
      { value: "quote", label: "Angebote" },
      { value: "invoice", label: "Rechnungen" },
      { value: "contract", label: "Verträge" },
    ],
    tplSave: "Als Vorlage speichern",
    tplSaving: "Wird gespeichert…",
    tplNamePlaceholder: "Vorlagenname (z. B. Lieferantenangebote)",
    tplConfirm: "Speichern",
    tplCancel: "Abbrechen",
    tplMyTemplates: "Meine Vorlagen",
    tplDelete: "Löschen",
    tplLoaded: (name: string) => `Vorlage: ${name}`,
    tplRerunHint: "Neue Dateien ablegen, um automatisch erneut auszuführen",
    tplLastRun: "Zuletzt ausgeführt",
    tplRunFiles: (n: number) => `${n} ${n === 1 ? "Datei" : "Dateien"}`,
    tplNoRuns: "Noch keine Ausführungen",
    tplEditDims: "Merkmale bearbeiten",
    tplDimLabel: "Bezeichnung",
    tplDimAdd: "+ Hinzufügen",
    tplDimApply: "Anwenden",
    tplDimReset: "Auf Standard zurücksetzen",
    tplNewFiles: "Neue Dateien",
    tplDims: "Merkmale",
    tplDropHere: "PDFs ablegen, um erneut auszuführen",
    retry: "Erneut versuchen",
  },
  ko: {
    badge: "비교 엔진",
    h1: "문서 비교",
    intro: `같은 종류의 PDF를 2~${MAX_FILES}개 업로드하세요. DockDocs가 브라우저에서 읽어 주요 항목을 나란히 정리합니다 — 출처를 찾을 수 있는 값에는 원문 줄을 함께 표시합니다.`,
    drop: "여기에 PDF를 끌어다 놓으세요",
    dropHint: "로컬에서 읽습니다 — 파일은 기기를 벗어나지 않습니다. 필드 추출은 서버에서 실행됩니다.",
    choose: "PDF 선택",
    samples: "샘플 견적서 3개 사용해 보기",
    extracting: "텍스트 추출 중…",
    typeLabel: "종류",
    compare: "필드 비교",
    comparing: "비교 중…",
    clear: "지우기",
    bExtracted: "텍스트 추출됨",
    bEmpty: "인식 안 됨(스캔본일 가능성 — OCR 필요)",
    ocrRun: "OCR로 텍스트 추출",
    ocrBusy: "OCR로 읽는 중… (몇 초 걸릴 수 있습니다)",
    bError: "읽기 실패",
    needTwo: "비교하려면 읽을 수 있는 문서를 2개 이상 추가하세요.",
    failed: "비교에 실패했습니다.",
    comparison: "비교 결과",
    dimension: "항목",
    notRecognized: "인식 안 됨",
    tableNote:
      "AI가 추출했습니다. 각 값에는 그 값이 나온 정확한 원문 줄이 표시됩니다(해당 문서에 실제로 나타나는지 확인됨). 「인식 안 됨」은 문서에 명시되지 않았다는 뜻이며 — 어떤 것도 추측하지 않습니다.",
    comingNext: "곧 제공",
    next: [
      "비교한 수치에 근거한 추천(어느 쪽이 우수한지, 그 이유)",
      "값을 클릭하면 원본 PDF의 정확한 위치로 이동",
      "비교할 항목을 직접 추가",
    ],
    docCount: (n: number) => `문서 ${n}개`,
    pages: (n: number) => `${n}페이지 · `,
    chars: (n: number) => `${n.toLocaleString()}자`,
    docTypes: [
      { value: "quote", label: "견적서" },
      { value: "invoice", label: "청구서" },
      { value: "contract", label: "계약서" },
    ],
    tplSave: "템플릿으로 저장",
    tplSaving: "저장 중…",
    tplNamePlaceholder: "템플릿 이름(예: 공급업체 견적서)",
    tplConfirm: "저장",
    tplCancel: "취소",
    tplMyTemplates: "내 템플릿",
    tplDelete: "삭제",
    tplLoaded: (name: string) => `템플릿: ${name}`,
    tplRerunHint: "새 파일을 끌어다 놓으면 자동으로 다시 실행됩니다",
    tplLastRun: "최근 실행",
    tplRunFiles: (n: number) => `파일 ${n}개`,
    tplNoRuns: "아직 실행 기록이 없습니다",
    tplEditDims: "항목 편집",
    tplDimLabel: "라벨",
    tplDimAdd: "+ 추가",
    tplDimApply: "적용",
    tplDimReset: "기본값으로 재설정",
    tplNewFiles: "새 파일",
    tplDims: "개 항목",
    tplDropHere: "PDF를 놓아 다시 실행",
    retry: "다시 시도",
  },
} as const satisfies AuthoredCopy<unknown>;

const REC = {
  en: {
    title: "Recommendation",
    thinking: "Weighing the options…",
    recommended: "Recommended",
    disclaimer: "This verdict is the AI's reasoning over the figures in the table below — unlike each table cell, it isn't individually source-checked. Confirm the numbers in the table before deciding.",
    recError: "Recommendation unavailable — the comparison table below is still accurate.",
  },
  zh: {
    title: "推荐",
    thinking: "正在权衡各选项…",
    recommended: "推荐",
    disclaimer: "此结论是 AI 基于下方表格里的数字做的推理——它不像表格每个单元格那样逐条核对过出处。决定前请以表格里的数字为准。",
    recError: "推荐加载失败——下方对比表仍然准确。",
  },
  es: {
    title: "Recomendación",
    thinking: "Sopesando las opciones…",
    recommended: "Recomendado",
    disclaimer: "Este veredicto es el razonamiento de la IA sobre las cifras de la tabla de abajo; a diferencia de cada celda de la tabla, no se verifica su fuente de forma individual. Confirma los números en la tabla antes de decidir.",
    recError: "Recomendación no disponible; la tabla de comparación sigue siendo precisa.",
  },
  pt: {
    title: "Recomendação",
    thinking: "Avaliando as opções…",
    recommended: "Recomendado",
    disclaimer: "Este veredicto é o raciocínio da IA sobre os números da tabela abaixo — ao contrário de cada célula da tabela, não é verificado individualmente em relação à fonte. Confirme os números na tabela antes de decidir.",
    recError: "Recomendação indisponível — a tabela de comparação abaixo continua precisa.",
  },
  fr: {
    title: "Recommandation",
    thinking: "Évaluation des options…",
    recommended: "Recommandé",
    disclaimer: "Ce verdict est le raisonnement de l'IA sur les chiffres du tableau ci-dessous — contrairement à chaque cellule du tableau, il n'est pas vérifié individuellement par rapport à la source. Confirmez les chiffres dans le tableau avant de décider.",
    recError: "Recommandation indisponible — le tableau de comparaison ci-dessous reste précis.",
  },
  ja: {
    title: "おすすめ",
    thinking: "選択肢を比較検討中…",
    recommended: "おすすめ",
    disclaimer: "この判定は、下の表の数値に基づく AI の推論です — 表の各セルとは異なり、出典を個別に照合してはいません。決定する前に、表の数値をご確認ください。",
    recError: "おすすめを読み込めませんでした — 下の比較表は引き続き正確です。",
  },
  de: {
    title: "Empfehlung",
    thinking: "Optionen werden abgewogen…",
    recommended: "Empfohlen",
    disclaimer: "Dieses Urteil ist die Schlussfolgerung der KI aus den Zahlen in der Tabelle unten – anders als jede einzelne Tabellenzelle wird es nicht einzeln gegen die Quelle geprüft. Bestätigen Sie die Zahlen in der Tabelle, bevor Sie entscheiden.",
    recError: "Empfehlung nicht verfügbar – die Vergleichstabelle unten ist weiterhin korrekt.",
  },
  ko: {
    title: "추천",
    thinking: "여러 선택지를 따져 보는 중…",
    recommended: "추천",
    disclaimer: "이 판단은 아래 표의 수치를 바탕으로 한 AI의 추론입니다 — 표의 각 셀과 달리 출처를 개별적으로 대조하지는 않았습니다. 결정하기 전에 표의 수치를 확인하세요.",
    recError: "추천을 불러올 수 없습니다 — 아래 비교 표는 여전히 정확합니다.",
  },
} as const satisfies AuthoredCopy<unknown>;

const TRACE = {
  en: { source: "Source", notLocated: "Couldn't locate the exact snippet — showing the full text." },
  zh: { source: "原文出处", notLocated: "未能精确定位片段——显示全文。" },
  es: { source: "Origen", notLocated: "No se pudo localizar el fragmento exacto: se muestra el texto completo." },
  pt: { source: "Origem", notLocated: "Não foi possível localizar o trecho exato — exibindo o texto completo." },
  fr: { source: "Source", notLocated: "Impossible de localiser l'extrait exact — affichage du texte intégral." },
  ja: { source: "出典", notLocated: "該当箇所を正確に特定できませんでした — 全文を表示しています。" },
  de: { source: "Quelle", notLocated: "Der genaue Ausschnitt ließ sich nicht finden – der vollständige Text wird angezeigt." },
  ko: { source: "출처", notLocated: "정확한 구절을 찾지 못했습니다 — 전체 텍스트를 표시합니다." },
} as const satisfies AuthoredCopy<unknown>;

// Localized dimension labels (the backend returns English labels).
const DIM_ZH: Record<string, string> = {
  vendor: "供应商",
  total_price: "总价",
  currency: "币种",
  delivery_time: "交期",
  payment_terms: "付款方式",
  warranty: "质保",
  validity: "有效期至",
  invoice_number: "发票号",
  total_amount: "总金额",
  issue_date: "开票日期",
  due_date: "到期日",
  parties: "签约方",
  effective_date: "生效日期",
  term: "期限",
  termination: "终止条款",
  governing_law: "管辖法律",
  liability: "责任上限",
};

// Mirrors DIMENSION_PRESETS in compare-extract.ts — used to show default
// dimensions in the editor before the first comparison result is back.
const CLIENT_PRESETS: Record<string, Array<{ key: string; label: string }>> = {
  quote: [
    { key: "vendor", label: "Vendor" },
    { key: "total_price", label: "Total price" },
    { key: "currency", label: "Currency" },
    { key: "delivery_time", label: "Delivery time" },
    { key: "payment_terms", label: "Payment terms" },
    { key: "warranty", label: "Warranty" },
    { key: "validity", label: "Valid until" },
  ],
  invoice: [
    { key: "vendor", label: "Vendor" },
    { key: "invoice_number", label: "Invoice #" },
    { key: "total_amount", label: "Total amount" },
    { key: "currency", label: "Currency" },
    { key: "issue_date", label: "Issue date" },
    { key: "due_date", label: "Due date" },
    { key: "payment_terms", label: "Payment terms" },
  ],
  contract: [
    { key: "parties", label: "Parties" },
    { key: "effective_date", label: "Effective date" },
    { key: "term", label: "Term / duration" },
    { key: "payment_terms", label: "Payment terms" },
    { key: "termination", label: "Termination" },
    { key: "governing_law", label: "Governing law" },
    { key: "liability", label: "Liability cap" },
  ],
};

function labelToKey(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `dim_${Date.now()}`;
}

function locateSnippet(text: string, snippet: string, ctx = 600) {
  // Match the backend trust gate's normalization (lowercase + collapse whitespace)
  // so a source it verified never silently fails to highlight here. The doc text
  // is already single-spaced, so collapse the snippet's whitespace too.
  const needle = snippet.replace(/\s+/g, " ").trim().toLowerCase();
  const idx = needle ? text.toLowerCase().indexOf(needle) : -1;
  if (idx < 0) return { found: false as const };
  const len = needle.length;
  const start = Math.max(0, idx - ctx);
  const end = Math.min(text.length, idx + len + ctx);
  return {
    found: true as const,
    before: (start > 0 ? "…" : "") + text.slice(start, idx),
    match: text.slice(idx, idx + len),
    after: text.slice(idx + len, end) + (end < text.length ? "…" : ""),
  };
}

// Resolve a doc's display name from an id, tolerating ids the LLM may echo
// imperfectly in the recommendation (falls back to the name before ".pdf").
function resolveDocName(docs: ReadonlyArray<{ id: string; name: string }>, id: string) {
  const exact = docs.find((d) => d.id === id);
  if (exact) return exact.name;
  const cleaned = id.replace(/(\.pdf).*$/i, "$1");
  return docs.find((d) => d.name === cleaned)?.name ?? cleaned;
}

// Cross-document Q&A copy (5 locales). The feature posts to /api/compare-qa,
// which verifies every cited snippet actually appears in the named document.
const QA: Record<BaseLocale, {
  title: string; desc: string; placeholder: string; ask: string; thinking: string;
  sources: string; noAnswer: string; errMaxDocs: string; errTooLong: string; errQuestion: string;
}> = {
  en: {
    title: "Ask across these documents",
    desc: "Ask one question across every document you uploaded — the answer shows its source when one can be located.",
    placeholder: "e.g. Which quote has the shortest delivery time?",
    ask: "Ask", thinking: "Thinking…", sources: "Sources",
    noAnswer: "Couldn't find an answer in these documents.",
    errMaxDocs: "Ask across up to 8 documents at a time.",
    errTooLong: "Combined text is too long (60,000-character limit). Use fewer or shorter documents.",
    errQuestion: "Question is too long (500-character limit).",
  },
  zh: {
    title: "跨文档提问",
    desc: "用一个问题问遍上传的所有文档，找得到原文时答案会带上出处。",
    placeholder: "例如：哪份报价的交期最短？",
    ask: "提问", thinking: "思考中…", sources: "出处",
    noAnswer: "未能从这些文档中找到答案。",
    errMaxDocs: "一次最多对 8 份文档提问。",
    errTooLong: "文档合计文字过长（上限 60,000 字符），请用更少或更短的文档。",
    errQuestion: "问题过长（上限 500 字符）。",
  },
  es: {
    title: "Pregunta a todos estos documentos",
    desc: "Haz una pregunta a todos los documentos que subiste — la respuesta muestra su fuente cuando puede localizarse.",
    placeholder: "p. ej. ¿Qué presupuesto tiene el plazo de entrega más corto?",
    ask: "Preguntar", thinking: "Pensando…", sources: "Fuentes",
    noAnswer: "No se encontró una respuesta en estos documentos.",
    errMaxDocs: "Pregunta a un máximo de 8 documentos a la vez.",
    errTooLong: "El texto combinado es demasiado largo (límite de 60.000 caracteres). Usa menos documentos o más cortos.",
    errQuestion: "La pregunta es demasiado larga (límite de 500 caracteres).",
  },
  pt: {
    title: "Pergunte a todos estes documentos",
    desc: "Faça uma pergunta a todos os documentos que você enviou — a resposta mostra a fonte quando ela pode ser localizada.",
    placeholder: "ex.: Qual orçamento tem o menor prazo de entrega?",
    ask: "Perguntar", thinking: "Pensando…", sources: "Fontes",
    noAnswer: "Não foi possível encontrar uma resposta nestes documentos.",
    errMaxDocs: "Pergunte a no máximo 8 documentos por vez.",
    errTooLong: "O texto combinado é muito longo (limite de 60.000 caracteres). Use menos documentos ou mais curtos.",
    errQuestion: "A pergunta é muito longa (limite de 500 caracteres).",
  },
  fr: {
    title: "Interrogez tous ces documents",
    desc: "Posez une seule question à tous les documents que vous avez importés — la réponse montre sa source lorsqu'elle peut être localisée.",
    placeholder: "ex. : Quel devis a le délai de livraison le plus court ?",
    ask: "Demander", thinking: "Réflexion…", sources: "Sources",
    noAnswer: "Aucune réponse trouvée dans ces documents.",
    errMaxDocs: "Interrogez jusqu'à 8 documents à la fois.",
    errTooLong: "Le texte combiné est trop long (limite de 60 000 caractères). Utilisez moins de documents ou plus courts.",
    errQuestion: "La question est trop longue (limite de 500 caractères).",
  },
  ja: {
    title: "これらの文書をまとめて質問",
    desc: "アップロードしたすべての文書に対して 1 つの質問ができます — 出典を特定できる場合は回答に表示されます。",
    placeholder: "例：交期が最も短い見積もりはどれですか？",
    ask: "送信", thinking: "考え中…", sources: "出典",
    noAnswer: "これらの文書から回答が見つかりませんでした。",
    errMaxDocs: "一度に質問できるのは最大 8 件の文書までです。",
    errTooLong: "テキストの合計が長すぎます（上限 60,000 文字）。文書の数を減らすか、短い文書をお使いください。",
    errQuestion: "質問が長すぎます（上限 500 文字）。",
  },
  de: {
    title: "Frage über alle diese Dokumente stellen",
    desc: "Stellen Sie eine Frage über alle hochgeladenen Dokumente hinweg – die Antwort zeigt ihre Quelle, sofern sich eine finden lässt.",
    placeholder: "z. B. Welches Angebot hat die kürzeste Lieferzeit?",
    ask: "Fragen", thinking: "Wird überlegt…", sources: "Quellen",
    noAnswer: "In diesen Dokumenten konnte keine Antwort gefunden werden.",
    errMaxDocs: "Stellen Sie Fragen über höchstens 8 Dokumente gleichzeitig.",
    errTooLong: "Der kombinierte Text ist zu lang (Grenze von 60.000 Zeichen). Verwenden Sie weniger oder kürzere Dokumente.",
    errQuestion: "Die Frage ist zu lang (Grenze von 500 Zeichen).",
  },
  ko: {
    title: "이 문서들에 대해 질문하기",
    desc: "업로드한 모든 문서에 하나의 질문을 던지세요 — 출처를 찾을 수 있을 때 답변에 출처가 표시됩니다.",
    placeholder: "예: 어느 견적서의 납기가 가장 짧나요?",
    ask: "질문", thinking: "생각 중…", sources: "출처",
    noAnswer: "이 문서들에서 답을 찾을 수 없었습니다.",
    errMaxDocs: "한 번에 최대 8개 문서까지 질문할 수 있습니다.",
    errTooLong: "합쳐진 텍스트가 너무 깁니다(60,000자 제한). 문서 수를 줄이거나 더 짧은 문서를 사용하세요.",
    errQuestion: "질문이 너무 깁니다(500자 제한).",
  },
};

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why compare documents with DockDocs",
    benefitsDescription: "Line up two PDFs side by side, ask questions that span both, and get a verdict drawn from those numbers — the AI reads the documents' text for you.",
    benefits: [
      { title: "Key terms lined up side by side", description: "The AI pulls vendor, price, dates, and terms from each PDF into one table, so the differences between two documents jump out instead of hiding across pages." },
      { title: "Answers point back to the source line", description: "When you ask a question across both documents and the answer draws on a specific line, it's shown with that source line — and the server verifies that snippet really appears in the named document before showing it." },
      { title: "A verdict you can check", description: "Get a recommendation on which option wins and why, with each underlying figure traceable to the table — so you can confirm the numbers before you decide." },
    ],
    workflowTitle: "How comparing fits your document work",
    workflowDescription: "For the moment two versions, two quotes, or two contracts need to be weighed against each other without re-reading both end to end.",
    steps: [
      "Upload the two PDFs you want to compare.",
      "The document's text is analyzed by AI to align fields, answer cross-document questions, or recommend a winner.",
      "Review the side-by-side table, ask a question, or read the data-backed verdict.",
    ],
    readingTitle: "More AI document tools",
    readingDescription: "Related ways to read, check, and pull facts out of your PDFs.",
    readingLinks: [
      { label: "Contract risk review", href: "/contract-risk", description: "Flag risky clauses in a single contract, each quoted risk tied to its source line." },
      { label: "Government bid matrix", href: "/govbid-matrix", description: "Turn a tender document into a structured requirements matrix you can act on." },
      { label: "Extract to Excel", href: "/extract-to-excel", description: "Pull tables and fields out of a PDF into a clean spreadsheet." },
    ],
  },
  zh: {
    benefitsTitle: "为什么用 DockDocs 对比文档",
    benefitsDescription: "把两份 PDF 并排摆开，跨两份提问，并拿到带依据的结论——AI 替你读取文档里的文字。",
    benefits: [
      { title: "关键条款并排呈现", description: "AI 从每份 PDF 里抽出供应商、价格、日期和条款，汇成一张表，让两份文档的差异一眼可见，不再散落在各页之间。" },
      { title: "答案指回原文出处", description: "当你跨两份文档提问、且答案确实依据某一句时，会把那句原文一并给出——而且服务器会先校验该片段确实出现在所指名的文档里，再展示给你。" },
      { title: "可核对的结论", description: "拿到“选哪个、为什么”的推荐，每一项依据数字都能追溯到表格——决定前你可以先核对数字。" },
    ],
    workflowTitle: "对比如何融入你的文档工作",
    workflowDescription: "当两个版本、两份报价或两份合同需要互相权衡，又不想把两份都从头读一遍时。",
    steps: [
      "上传你要对比的两份 PDF。",
      "由 AI 分析文档里的文字，对齐字段、回答跨文档问题或推荐优选项。",
      "查看并排对比表、提一个问题，或阅读带依据的结论。",
    ],
    readingTitle: "更多 AI 文档工具",
    readingDescription: "阅读、核查并从 PDF 中抽取事实的相关方式。",
    readingLinks: [
      { label: "合同风险审阅", href: "/contract-risk", description: "标记单份合同里的高风险条款，引用到的每条风险都对应原文出处。" },
      { label: "政府招标矩阵", href: "/govbid-matrix", description: "把招标文件转成可执行的结构化需求矩阵。" },
      { label: "抽取到 Excel", href: "/extract-to-excel", description: "把 PDF 里的表格和字段抽取成一张干净的表格。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué comparar documentos con DockDocs",
    benefitsDescription: "Coloca dos PDF lado a lado, haz preguntas que abarcan ambos y obtén un veredicto basado en los datos: la IA lee el texto de los documentos por ti.",
    benefits: [
      { title: "Términos clave alineados lado a lado", description: "La IA extrae proveedor, precio, fechas y condiciones de cada PDF en una sola tabla, para que las diferencias entre dos documentos salten a la vista en vez de ocultarse entre páginas." },
      { title: "Las respuestas remiten a la línea de origen", description: "Cuando haces una pregunta sobre ambos documentos y la respuesta se basa en una línea concreta, se muestra junto a esa línea de origen, y el servidor verifica que ese fragmento realmente aparece en el documento indicado antes de mostrarlo." },
      { title: "Un veredicto que puedes comprobar", description: "Obtén una recomendación sobre qué opción gana y por qué, con cada cifra de base rastreable hasta la tabla, para que confirmes los números antes de decidir." },
    ],
    workflowTitle: "Cómo encaja la comparación en tu trabajo",
    workflowDescription: "Para cuando dos versiones, dos presupuestos o dos contratos deben sopesarse entre sí sin releer ambos de principio a fin.",
    steps: [
      "Sube los dos PDF que quieres comparar.",
      "La IA analiza el texto del documento para alinear campos, responder preguntas entre documentos o recomendar un ganador.",
      "Revisa la tabla comparativa, haz una pregunta o lee el veredicto basado en los datos.",
    ],
    readingTitle: "Más herramientas de documentos con IA",
    readingDescription: "Formas relacionadas de leer, revisar y extraer datos de tus PDF.",
    readingLinks: [
      { label: "Revisión de riesgos de contrato", href: "/contract-risk", description: "Marca cláusulas de riesgo en un solo contrato, cada riesgo citado ligado a su línea de origen." },
      { label: "Matriz de licitaciones", href: "/govbid-matrix", description: "Convierte un pliego de licitación en una matriz de requisitos estructurada y accionable." },
      { label: "Extraer a Excel", href: "/extract-to-excel", description: "Extrae tablas y campos de un PDF a una hoja de cálculo limpia." },
    ],
  },
  pt: {
    benefitsTitle: "Por que comparar documentos com o DockDocs",
    benefitsDescription: "Coloque dois PDFs lado a lado, faça perguntas que abrangem ambos e obtenha um veredicto baseado nos dados — a IA lê o texto dos documentos para você.",
    benefits: [
      { title: "Termos-chave alinhados lado a lado", description: "A IA extrai fornecedor, preço, datas e condições de cada PDF em uma única tabela, para que as diferenças entre dois documentos saltem aos olhos em vez de se esconderem entre as páginas." },
      { title: "As respostas remetem à linha de origem", description: "Quando você faz uma pergunta sobre os dois documentos e a resposta se baseia em uma linha específica, ela é exibida com essa linha de origem — e o servidor verifica se esse trecho realmente aparece no documento indicado antes de exibi-lo." },
      { title: "Um veredicto que você pode conferir", description: "Receba uma recomendação sobre qual opção vence e por quê, com cada número de base rastreável até a tabela — para que você confirme os números antes de decidir." },
    ],
    workflowTitle: "Como a comparação se encaixa no seu trabalho",
    workflowDescription: "Para quando duas versões, dois orçamentos ou dois contratos precisam ser pesados entre si sem reler ambos do início ao fim.",
    steps: [
      "Envie os dois PDFs que deseja comparar.",
      "A IA analisa o texto do documento para alinhar campos, responder perguntas entre documentos ou recomendar um vencedor.",
      "Revise a tabela comparativa, faça uma pergunta ou leia o veredicto baseado nos dados.",
    ],
    readingTitle: "Mais ferramentas de documentos com IA",
    readingDescription: "Formas relacionadas de ler, verificar e extrair dados dos seus PDFs.",
    readingLinks: [
      { label: "Análise de risco de contrato", href: "/contract-risk", description: "Sinalize cláusulas arriscadas em um único contrato, cada risco citado ligado à sua linha de origem." },
      { label: "Matriz de licitações", href: "/govbid-matrix", description: "Transforme um edital em uma matriz de requisitos estruturada e acionável." },
      { label: "Extrair para Excel", href: "/extract-to-excel", description: "Extraia tabelas e campos de um PDF para uma planilha limpa." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi comparer des documents avec DockDocs",
    benefitsDescription: "Placez deux PDF côte à côte, posez des questions couvrant les deux et obtenez un verdict fondé sur les chiffres — l'IA lit le texte des documents pour vous.",
    benefits: [
      { title: "Termes clés alignés côte à côte", description: "L'IA extrait fournisseur, prix, dates et conditions de chaque PDF dans un seul tableau, pour que les différences entre deux documents sautent aux yeux au lieu de se cacher au fil des pages." },
      { title: "Les réponses renvoient à la ligne source", description: "Lorsque vous posez une question sur les deux documents et que la réponse s'appuie sur une ligne précise, celle-ci est affichée avec sa ligne d'origine — et le serveur vérifie que cet extrait apparaît réellement dans le document nommé avant de l'afficher." },
      { title: "Un verdict que vous pouvez vérifier", description: "Obtenez une recommandation sur l'option gagnante et pourquoi, chaque chiffre sous-jacent étant traçable jusqu'au tableau — pour confirmer les chiffres avant de décider." },
    ],
    workflowTitle: "Comment la comparaison s'intègre à votre travail",
    workflowDescription: "Pour le moment où deux versions, deux devis ou deux contrats doivent être mis en balance sans relire les deux de bout en bout.",
    steps: [
      "Importez les deux PDF que vous souhaitez comparer.",
      "L'IA analyse le texte du document pour aligner les champs, répondre aux questions transversales ou recommander un gagnant.",
      "Consultez le tableau comparatif, posez une question ou lisez le verdict fondé sur les chiffres.",
    ],
    readingTitle: "Plus d'outils de documents IA",
    readingDescription: "Des façons connexes de lire, vérifier et extraire des données de vos PDF.",
    readingLinks: [
      { label: "Analyse des risques d'un contrat", href: "/contract-risk", description: "Repérez les clauses à risque d'un seul contrat, chaque risque cité lié à sa ligne source." },
      { label: "Matrice d'appel d'offres", href: "/govbid-matrix", description: "Transformez un dossier d'appel d'offres en une matrice d'exigences structurée et exploitable." },
      { label: "Extraire vers Excel", href: "/extract-to-excel", description: "Extrayez les tableaux et champs d'un PDF vers une feuille de calcul propre." },
    ],
  },
  ja: {
    benefitsTitle: "DockDocs でドキュメントを比較する理由",
    benefitsDescription: "2 つの PDF を並べて、両方にまたがる質問をし、数値に基づく結論を得られます — AI が文書のテキストを読み取ります。",
    benefits: [
      { title: "主要項目を横並びで整理", description: "AI が各 PDF から取引先・価格・日付・条件を 1 つの表に抽出するので、2 つの文書の違いがページ間に埋もれず一目で分かります。" },
      { title: "回答は出典の一文を示す", description: "両方の文書にまたがる質問をしたとき、回答が特定の一文に基づく場合は、その出典の一文とともに示されます — しかも表示前に、その一節が指定の文書に実際に出現することをサーバーが検証します。" },
      { title: "確認できる結論", description: "どの選択肢が優れているか、その理由とともに推奨を提示します。根拠となる各数値は表まで遡れるので、決定前に数値を確認できます。" },
    ],
    workflowTitle: "比較が文書作業にどう役立つか",
    workflowDescription: "2 つのバージョン、2 件の見積もり、2 件の契約書を、両方を最初から読み直さずに突き合わせて検討したいとき。",
    steps: [
      "比較したい 2 つの PDF をアップロードします。",
      "AI が文書のテキストを解析し、項目をそろえ、文書横断の質問に答え、優れた選択肢を推奨します。",
      "横並びの比較表を確認し、質問をするか、数値に基づく結論を読みます。",
    ],
    readingTitle: "その他の AI ドキュメントツール",
    readingDescription: "PDF を読み取り、確認し、事実を抽出する関連ツール。",
    readingLinks: [
      { label: "契約リスクレビュー", href: "/contract-risk", description: "1 件の契約書のリスク条項を抽出し、引用できた各リスクを出典の一文に紐づけます。" },
      { label: "入札要件マトリクス", href: "/govbid-matrix", description: "入札文書を、実行できる構造化された要件マトリクスに変換します。" },
      { label: "Excel に抽出", href: "/extract-to-excel", description: "PDF の表や項目を、整ったスプレッドシートに抽出します。" },
    ],
  },
  de: {
    benefitsTitle: "Warum Dokumente mit DockDocs vergleichen",
    benefitsDescription: "Stellen Sie zwei PDFs nebeneinander, stellen Sie Fragen, die beide umfassen, und erhalten Sie ein Urteil auf Basis dieser Zahlen – die KI liest den Text der Dokumente für Sie.",
    benefits: [
      { title: "Wichtige Angaben nebeneinander", description: "Die KI zieht Lieferant, Preis, Daten und Konditionen aus jedem PDF in eine Tabelle, sodass die Unterschiede zwischen zwei Dokumenten sofort ins Auge springen, statt sich über die Seiten zu verteilen." },
      { title: "Antworten verweisen auf die Quellzeile", description: "Wenn Sie eine Frage über beide Dokumente stellen und sich die Antwort auf eine bestimmte Zeile stützt, wird sie mit dieser Quellzeile angezeigt – und der Server prüft, dass dieser Ausschnitt tatsächlich im genannten Dokument vorkommt, bevor er ihn anzeigt." },
      { title: "Ein Urteil, das Sie überprüfen können", description: "Erhalten Sie eine Empfehlung, welche Option gewinnt und warum, wobei jede zugrunde liegende Zahl bis zur Tabelle nachvollziehbar ist – so können Sie die Zahlen bestätigen, bevor Sie entscheiden." },
    ],
    workflowTitle: "Wie der Vergleich in Ihre Dokumentenarbeit passt",
    workflowDescription: "Für den Moment, in dem zwei Versionen, zwei Angebote oder zwei Verträge gegeneinander abgewogen werden müssen, ohne beide von vorne bis hinten neu zu lesen.",
    steps: [
      "Laden Sie die beiden PDFs hoch, die Sie vergleichen möchten.",
      "Der Text des Dokuments wird von der KI analysiert, um Felder anzugleichen, dokumentübergreifende Fragen zu beantworten oder einen Sieger zu empfehlen.",
      "Sehen Sie sich die Vergleichstabelle an, stellen Sie eine Frage oder lesen Sie das von Zahlen gestützte Urteil.",
    ],
    readingTitle: "Weitere KI-Dokumententools",
    readingDescription: "Verwandte Wege, Ihre PDFs zu lesen, zu prüfen und Fakten daraus zu ziehen.",
    readingLinks: [
      { label: "Vertragsrisiko-Prüfung", href: "/contract-risk", description: "Markieren Sie riskante Klauseln in einem einzelnen Vertrag, jedes zitierte Risiko an seine Quellzeile gebunden." },
      { label: "Ausschreibungsmatrix", href: "/govbid-matrix", description: "Verwandeln Sie ein Ausschreibungsdokument in eine strukturierte Anforderungsmatrix, mit der Sie arbeiten können." },
      { label: "Nach Excel extrahieren", href: "/extract-to-excel", description: "Ziehen Sie Tabellen und Felder aus einem PDF in eine saubere Tabelle." },
    ],
  },
  ko: {
    benefitsTitle: "DockDocs로 문서를 비교하는 이유",
    benefitsDescription: "두 PDF를 나란히 놓고, 둘 모두에 걸친 질문을 던지고, 그 수치에서 도출된 판단을 받아 보세요 — AI가 문서의 텍스트를 대신 읽어 줍니다.",
    benefits: [
      { title: "주요 항목을 나란히 정렬", description: "AI가 각 PDF에서 공급업체, 가격, 날짜, 조건을 하나의 표로 뽑아내, 두 문서의 차이가 여러 페이지에 흩어지지 않고 한눈에 드러납니다." },
      { title: "답변이 출처 줄을 가리킵니다", description: "두 문서에 걸친 질문을 했을 때 답변이 특정 줄에 근거하면, 그 출처 줄과 함께 표시됩니다 — 그리고 서버는 해당 구절이 지정된 문서에 실제로 나타나는지 확인한 뒤에야 보여 줍니다." },
      { title: "확인할 수 있는 판단", description: "어느 선택지가 우수한지와 그 이유를 추천받되, 근거가 된 각 수치는 표까지 추적할 수 있습니다 — 결정 전에 수치를 확인할 수 있습니다." },
    ],
    workflowTitle: "비교가 문서 작업에 어떻게 맞물리나요",
    workflowDescription: "두 버전, 두 견적서, 두 계약서를 양쪽 모두 처음부터 끝까지 다시 읽지 않고 서로 견주어 봐야 하는 순간을 위한 기능입니다.",
    steps: [
      "비교하려는 두 PDF를 업로드하세요.",
      "AI가 문서의 텍스트를 분석해 필드를 정렬하고, 문서 간 질문에 답하거나, 우수한 쪽을 추천합니다.",
      "나란히 놓인 비교 표를 검토하고, 질문을 하거나, 데이터에 근거한 판단을 읽어 보세요.",
    ],
    readingTitle: "더 많은 AI 문서 도구",
    readingDescription: "PDF를 읽고, 확인하고, 사실을 뽑아내는 관련 방법들입니다.",
    readingLinks: [
      { label: "계약 위험 검토", href: "/contract-risk", description: "한 계약서의 위험 조항을 표시하고, 인용된 각 위험을 출처 줄과 연결합니다." },
      { label: "정부 입찰 매트릭스", href: "/govbid-matrix", description: "입찰 문서를 실행 가능한 구조화된 요건 매트릭스로 바꿉니다." },
      { label: "Excel로 추출", href: "/extract-to-excel", description: "PDF의 표와 필드를 깔끔한 스프레드시트로 뽑아냅니다." },
    ],
  },
};

export function DocumentCompareClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is fully authored (STR/REC/TRACE/QA/SECTIONS all carry Korean). zh-Hant derives from zh.
  const cl: BaseLocale = locale === "zh-Hant" ? "zh" : locale;
  // ko → English engine/runtime (child widgets / OCR / notices lack ko); zh-Hant preserved.
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[cl];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[cl];
  const r = locale === "zh-Hant" ? deepHant(REC.zh) : REC[cl];
  const tr = locale === "zh-Hant" ? deepHant(TRACE.zh) : TRACE[cl];
  const qa = locale === "zh-Hant" ? deepHant(QA.zh) : QA[cl];
  const [results, setResults] = useState<DocResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType] = useState("quote");
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [trace, setTrace] = useState<{ docId: string; docName: string; snippet: string } | null>(null);
  const [qaQ, setQaQ] = useState("");
  const [qaBusy, setQaBusy] = useState(false);
  const [qaAns, setQaAns] = useState<{ answer: string; sources: Array<{ docId: string; name: string; snippet: string }> } | null>(null);
  const [qaErr, setQaErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [ocrBusy, setOcrBusy] = useState<Set<string>>(new Set());
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [templates, setTemplates] = useState<FlowTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<FlowTemplate | null>(null);
  const [showSaveTpl, setShowSaveTpl] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplSaving, setTplSaving] = useState(false);
  const [rerunReady, setRerunReady] = useState(false);
  const [templateRuns, setTemplateRuns] = useState<FlowRun[]>([]);
  const compareRef = useRef<() => Promise<void>>(async () => {});
  const [recError, setRecError] = useState<string | null>(null);
  const [customDims, setCustomDims] = useState<Array<{ key: string; label: string }> | null>(null);
  const [editDims, setEditDims] = useState(false);
  const [editDimsRows, setEditDimsRows] = useState<Array<{ key: string; label: string }>>([]);
  const [cardDragTarget, setCardDragTarget] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  // Auto-trigger compare when a template is loaded and >= 2 readable docs are added.
  useEffect(() => {
    if (!rerunReady || comparing || comparison) return;
    const ok = results.filter((r) => r.status === "ok");
    if (ok.length >= 2) {
      setRerunReady(false);
      void compareRef.current();
    }
  }, [results, rerunReady, comparing, comparison]);

  const extractOne = useCallback(async (file: File): Promise<DocResult> => {
    const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
      }
      const trimmed = text.replace(/\s+/g, " ").trim();
      const numPages = doc.numPages;
      try { doc.destroy(); } catch { /* ignore */ }
      return { id, name: file.name, pages: numPages, chars: trimmed.length, text: trimmed, status: trimmed.length > 0 ? "ok" : "empty", file };
    } catch (e) {
      const msg = isEncryptedPdfError(e) ? encryptedPdfNotice(childLocale) : e instanceof Error ? e.message : String(e);
      return { id, name: file.name, pages: 0, chars: 0, text: "", status: "error", error: msg, file };
    }
  }, [childLocale]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
      if (pdfs.length === 0) return;
      setBusy(true);
      setComparison(null);
      const extracted: DocResult[] = [];
      for (const f of pdfs) extracted.push(await extractOne(f));
      setResults((prev) => [...prev, ...extracted].slice(0, MAX_FILES));
      setBusy(false);
    },
    [extractOne],
  );

  // Re-read a scanned (empty) doc with in-browser OCR (free, client-side tesseract).
  const runOcrOn = useCallback(async (id: string) => {
    const doc = results.find((d) => d.id === id);
    if (!doc?.file) return;
    setOcrBusy((prev) => new Set(prev).add(id));
    try {
      const { runOcrPdfFirstPage } = await import("../../../shared/templates/pdf-tool-page/ocr-runtime");
      const res = await runOcrPdfFirstPage({
        file: doc.file,
        outputFileName: doc.name,
        pageRanges: "1-3",
        language: locale === "zh" || locale === "zh-Hant" ? "chi_sim" : "eng",
        // OCR progress strings exist for 6 locales + zh-Hant only; de/ko have no engine
        // copy, so collapse de/ko→"en" (intended English fallback, same as page.tsx).
        locale: locale === "de" || locale === "ko" ? "en" : locale,
      });
      const text = (res.text ?? "").replace(/\s+/g, " ").trim();
      setResults((prev) => prev.map((d) => (d.id === id ? { ...d, text, chars: text.length, status: text ? "ok" : "empty", error: text ? undefined : d.error } : d)));
    } catch (e) {
      setResults((prev) => prev.map((d) => (d.id === id ? { ...d, status: "empty", error: e instanceof Error ? e.message : String(e) } : d)));
    } finally {
      setOcrBusy((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  }, [results, locale]);

  const loadSamples = useCallback(async () => {
    setBusy(true);
    const { PDFDocument, StandardFonts } = await import("pdf-lib");
    const make = async (vendor: string, lines: string[]) => {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      let y = 790;
      page.drawText(`Quotation — ${vendor}`, { x: 50, y, size: 18, font: bold });
      y -= 36;
      for (const line of lines) {
        page.drawText(line, { x: 50, y, size: 12, font });
        y -= 22;
      }
      const bytes = await doc.save();
      return new File([bytes], `quote-${vendor.toLowerCase().replace(/\s+/g, "-")}.pdf`, { type: "application/pdf" });
    };
    const samples = await Promise.all([
      make("Acme Supplies", ["Total price: USD 12,400", "Delivery: 30 days", "Payment terms: 50% upfront, 50% on delivery", "Warranty: 12 months", "Valid until: 2026-07-15"]),
      make("Globex Trading", ["Total price: USD 11,900", "Delivery: 45 days", "Payment terms: Net 30", "Warranty: 24 months", "Valid until: 2026-07-31"]),
      make("Initech Ltd", ["Total price: USD 13,200", "Delivery: 21 days", "Payment terms: 100% on delivery", "Warranty: 18 months", "Valid until: 2026-07-10"]),
    ]);
    setBusy(false);
    setDocType("quote");
    await addFiles(samples);
  }, [addFiles]);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles],
  );

  const okDocs = results.filter((r) => r.status === "ok");

  const compare = useCallback(async () => {
    if (okDocs.length < 2) {
      setCompareError(t.needTwo);
      return;
    }
    setComparing(true);
    setCompareError(null);
    setComparison(null);
    setRecommendation(null);
    setLimitHit(null);
    setRecError(null);
    const gate = await checkUsage("compare");
    if (!gate.allowed) {
      setLimitHit(gate.limit);
      setComparing(false);
      return;
    }
    try {
      const auth = await authHeader();
      const res = await fetch("/api/compare-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({
          docType,
          locale,
          ...(customDims ? { dimensions: customDims } : {}),
          documents: okDocs.map((d) => ({ id: d.id, name: d.name, text: d.text })),
        }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setCompareError(data?.message || t.failed);
        return;
      }
      const cmp: Comparison = { docType: data.docType, dimensions: data.dimensions, documents: data.documents };
      setComparison(cmp);
      trackToolRun("compare");
      void markUsage(gate, "compare");
      if (activeTemplate) {
        saveRun({ templateId: activeTemplate.id, templateName: activeTemplate.name, fileNames: okDocs.map((d) => d.name), docType: cmp.docType, status: "ok" });
        setTemplateRuns(loadRunsForTemplate(activeTemplate.id));
      }
      // Auto-recommend on the extracted comparison — the "decide for you" payoff.
      setRecommending(true);
      try {
        const rr = await fetch("/api/compare-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ docType: cmp.docType, locale, dimensions: cmp.dimensions, documents: cmp.documents }),
        });
        const rd = await rr.json();
        if (rd?.ok && rd.recommendation) setRecommendation(rd.recommendation);
        else setRecError(r.recError);
      } catch {
        setRecError(r.recError);
      } finally {
        setRecommending(false);
      }
    } catch (e) {
      setCompareError(e instanceof Error ? e.message : t.failed);
    } finally {
      setComparing(false);
    }
  }, [okDocs, docType, locale, t, r, activeTemplate]);

  // Keep ref in sync so the auto-trigger effect always calls the latest closure.
  useEffect(() => { compareRef.current = compare; }, [compare]);

  useEffect(() => {
    if (!trace) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setTrace(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [trace]);

  const handleSaveTemplate = () => {
    const name = tplName.trim();
    if (!name || !comparison) return;
    setTplSaving(true);
    const tpl = saveTemplate({ name, docType: comparison.docType, dimensions: comparison.dimensions });
    setTemplates(loadTemplates());
    setActiveTemplate(tpl);
    setShowSaveTpl(false);
    setTplName("");
    setTplSaving(false);
  };

  const handleLoadTemplate = (tpl: FlowTemplate) => {
    setDocType(tpl.docType);
    setCustomDims(tpl.dimensions.length > 0 ? tpl.dimensions : null);
    setEditDims(false);
    setActiveTemplate(tpl);
    setComparison(null);
    setRecommendation(null);
    setRerunReady(true);
    setTemplateRuns(loadRunsForTemplate(tpl.id));
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(loadTemplates());
    if (activeTemplate?.id === id) setActiveTemplate(null);
  };

  const badge = (status: DocStatus) =>
    status === "ok"
      ? { label: t.bExtracted, cls: "text-[color:var(--accent)] border-[color:var(--accent)]" }
      : status === "empty"
        ? { label: t.bEmpty, cls: "text-amber-400 border-amber-400/50" }
        : { label: t.bError, cls: "text-red-400 border-red-400/50" };

  const dimLabel = (key: string, fallback: string) => (locale === "zh" ? DIM_ZH[key] ?? fallback : locale === "zh-Hant" ? toHant(DIM_ZH[key] ?? fallback) : fallback);

  const askQa = async () => {
    const q = qaQ.trim();
    if (!q || okDocs.length === 0) return;
    // Pre-checks mirroring /api/compare-qa so the user gets instant feedback
    // instead of a round-trip rejection.
    if (okDocs.length > 8) {
      setQaErr(qa.errMaxDocs);
      return;
    }
    const totalChars = okDocs.reduce((s, d) => s + d.text.length, 0);
    if (totalChars > 60_000) {
      setQaErr(qa.errTooLong);
      return;
    }
    if (q.length > 500) {
      setQaErr(qa.errQuestion);
      return;
    }
    setQaBusy(true);
    setQaErr(null);
    setQaAns(null);
    try {
      const auth = await authHeader();
      const res = await fetch("/api/compare-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ question: q, locale, documents: okDocs.map((d) => ({ id: d.id, name: d.name, text: d.text })) }),
      });
      const data = await res.json();
      if (data?.ok && typeof data.answer === "string" && data.answer.trim()) {
        setQaAns({ answer: data.answer, sources: Array.isArray(data.sources) ? data.sources : [] });
      } else if (data?.ok) {
        setQaErr(qa.noAnswer);
      } else {
        setQaErr(data?.message || "Failed.");
      }
    } catch (e) {
      setQaErr(e instanceof Error ? e.message : String(e));
    } finally {
      setQaBusy(false);
    }
  };

  const Wrapper: "main" | "div" = embedded ? "div" : "main";
  return (
    <Wrapper className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : "mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8"}>
      {!embedded && (
        <>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
            {t.badge}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">{t.h1}</h1>
          <p className="mt-3 max-w-4xl text-[color:var(--muted)]">{t.intro}</p>
        </>
      )}
      {embedded && <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.intro}</p>}

      {templates.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t.tplMyTemplates}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => {
              const runs = loadRunsForTemplate(tpl.id);
              const lastRun = runs[0];
              const isActive = activeTemplate?.id === tpl.id;
              const isDragTarget = cardDragTarget === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onDragOver={(e) => { e.preventDefault(); setCardDragTarget(tpl.id); }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setCardDragTarget(null); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setCardDragTarget(null);
                    handleLoadTemplate(tpl);
                    void addFiles(Array.from(e.dataTransfer.files));
                  }}
                  className={`relative rounded-[var(--radius-lg)] border p-4 transition ${
                    isDragTarget
                      ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)] scale-[1.02]"
                      : isActive
                      ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
                      : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--line-strong)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleLoadTemplate(tpl)}
                      className="text-sm font-semibold text-[color:var(--foreground)] text-left hover:text-[color:var(--accent)] transition"
                    >
                      {tpl.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      title={t.tplDelete}
                      className="shrink-0 text-[11px] text-[color:var(--error)] opacity-0 transition hover:opacity-80 group-hover:opacity-60 focus:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--faint)]">
                    {tpl.docType} · {tpl.dimensions.length} {t.tplDims}
                  </p>
                  {lastRun ? (
                    <p className="mt-0.5 text-[11px] text-[color:var(--faint)]">
                      {t.tplLastRun}: {relativeTime(lastRun.createdAt, cl === "ko" ? "en" : cl)} · {t.tplRunFiles(lastRun.fileNames.length)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-[color:var(--faint)]">{t.tplNoRuns}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { handleLoadTemplate(tpl); inputRef.current?.click(); }}
                      className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-[color:var(--accent)] px-2.5 text-[11px] font-medium text-[color:var(--accent)] transition hover:bg-[color:var(--soft-accent)]"
                    >
                      {t.tplNewFiles}
                    </button>
                    {isActive && (
                      <span className="text-[11px] font-medium text-[color:var(--accent)]">✓</span>
                    )}
                  </div>
                  {isDragTarget && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-[color:var(--soft-accent)]/90 text-[13px] font-semibold text-[color:var(--accent)]">
                      {t.tplDropHere}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
        onDrop={onDrop}
        className={`mt-8 ${dropzoneShell(dragOver)}`}
      >
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--accent)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
        </span>
        <p className="text-sm font-medium text-[color:var(--foreground)]">{t.drop}</p>
        <p className="mt-1 text-xs text-[color:var(--muted)]">{t.dropHint}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} disabled={busy} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {t.choose}
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); loadSamples(); }} disabled={busy} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50">
            {t.samples}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[color:var(--faint)]">
          <span>{locale === "zh-Hant" ? deepHant("支持") : locale === "zh" ? "支持" : locale === "ja" ? "対応形式" : locale === "de" ? "Unterstützt" : locale === "ko" ? "지원 형식" : "Supports"} PDF</span>
          <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
          <span className="text-[color:var(--muted)]">{locale === "zh-Hant" ? deepHant("本地读取 · 内容服务端分析") : locale === "zh" ? "本地读取 · 内容服务端分析" : locale === "ja" ? "ローカルで読み取り · サーバーで分析" : locale === "es" ? "Leído localmente · análisis en servidor" : locale === "pt" ? "Lido localmente · análise no servidor" : locale === "fr" ? "Lu localement · analyse côté serveur" : locale === "de" ? "Lokal gelesen · Analyse auf Server" : locale === "ko" ? "로컬에서 읽기 · 서버에서 분석" : "File read locally · analyzed on server"}</span>
        </div>
      </div>

      {busy && <p className="mt-4 text-sm text-[color:var(--muted)]">{t.extracting}</p>}
      {embedded && results.length === 0 && <WorkspaceValueZone type="ai" locale={childLocale} />}

      {results.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{t.docCount(results.length)}</h2>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[color:var(--muted)]">{t.typeLabel}</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-2 text-sm text-[color:var(--foreground)]">
                {t.docTypes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <button type="button" onClick={compare} disabled={comparing || okDocs.length < 2} className="inline-flex h-9 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {comparing ? t.comparing : t.compare}
              </button>
              <button type="button" onClick={() => { setResults([]); setComparison(null); setCompareError(null); setRecommendation(null); setQaAns(null); setQaErr(null); setQaQ(""); setTrace(null); setOcrBusy(new Set()); setCustomDims(null); setEditDims(false); }} className="text-xs font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
                {t.clear}
              </button>
            </div>
          </div>
          {/* Dimensions panel */}
          {!editDims ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {(customDims ?? CLIENT_PRESETS[docType] ?? CLIENT_PRESETS.quote).map((d) => (
                <span key={d.key} className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-0.5 text-[11px] text-[color:var(--muted)]">
                  {dimLabel(d.key, d.label)}
                </span>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEditDimsRows([...(customDims ?? CLIENT_PRESETS[docType] ?? CLIENT_PRESETS.quote)]);
                  setEditDims(true);
                }}
                className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                {t.tplEditDims}
              </button>
            </div>
          ) : (
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
              <div className="space-y-1.5">
                {editDimsRows.map((row, i) => (
                  <div key={`${row.key}-${i}`} className="flex items-center gap-2">
                    <input
                      value={row.label}
                      onChange={(e) => setEditDimsRows((prev) => prev.map((r, idx) => idx === i ? { ...r, label: e.target.value } : r))}
                      placeholder={t.tplDimLabel}
                      className="h-8 flex-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-2 text-[13px] text-[color:var(--foreground)] outline-none focus:border-[color:var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setEditDimsRows((prev) => prev.filter((_, idx) => idx !== i))}
                      className="px-1 text-[11px] text-[color:var(--error)] transition hover:opacity-80"
                    >✕</button>
                  </div>
                ))}
              </div>
              {editDimsRows.length < 12 && (
                <button
                  type="button"
                  onClick={() => setEditDimsRows((prev) => [...prev, { key: `custom_${prev.length + 1}`, label: "" }])}
                  className="mt-2 text-[12px] font-medium text-[color:var(--accent)] transition hover:opacity-80"
                >
                  {t.tplDimAdd}
                </button>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const valid = editDimsRows.filter((r) => r.label.trim()).map((r) => ({ key: r.key.startsWith("custom_") ? labelToKey(r.label) : r.key, label: r.label.trim() }));
                    setCustomDims(valid.length > 0 ? valid : null);
                    setEditDims(false);
                  }}
                  className="rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90"
                >
                  {t.tplDimApply}
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomDims(null); setEditDims(false); }}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)]"
                >
                  {t.tplDimReset}
                </button>
              </div>
            </div>
          )}

          {results.map((r) => {
            const b = badge(r.status);
            return (
              <div key={r.id} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{r.name}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{t.pages(r.pages)}{t.chars(r.chars)}{r.file ? ` · ${formatBytes(r.file.size)}` : ""}</p>
                {r.status === "empty" && r.file && (
                  ocrBusy.has(r.id) ? (
                    <p className="mt-2 text-xs font-medium text-[color:var(--accent)]">{t.ocrBusy}</p>
                  ) : (
                    <button type="button" onClick={() => runOcrOn(r.id)} className="mt-2 rounded-[var(--radius-sm)] border border-[color:var(--accent)] px-3 py-1 text-[12px] font-medium text-[color:var(--accent-strong)] transition hover:bg-[color:var(--soft-accent)]">
                      {t.ocrRun}
                    </button>
                  )
                )}
                {r.status === "empty" && !ocrBusy.has(r.id) && r.error && (
                  <p className="mt-1 text-[11px] text-amber-400/80">{r.error}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {compareError && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p role="alert" className="rounded-[var(--radius)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{compareError}</p>
          <button type="button" onClick={compare} disabled={comparing || okDocs.length < 2} className="inline-flex h-9 items-center rounded-[var(--radius)] border border-red-400/40 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50">
            {t.retry}
          </button>
        </div>
      )}

      {limitHit !== null && <UpgradePrompt locale={childLocale === "ko" ? "en" : childLocale} limit={limitHit} />}

      {okDocs.length >= 1 && (
        <section id="ask" className="mt-10">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{qa.title}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{qa.desc}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={qaQ}
              onChange={(e) => setQaQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") askQa(); }}
              placeholder={qa.placeholder}
              className="h-10 min-w-[220px] flex-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm text-[color:var(--foreground)]"
            />
            <button type="button" onClick={askQa} disabled={qaBusy || !qaQ.trim()} className="h-10 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {qaBusy ? qa.thinking : qa.ask}
            </button>
          </div>
          {qaErr && <p className="mt-3 rounded-[var(--radius)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{qaErr}</p>}
          {qaAns && (
            <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{qaAns.answer}</p>
              {qaAns.sources.length > 0 && (
                <div className="mt-3 border-t border-[color:var(--line)] pt-3">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">{qa.sources}</p>
                  <ul className="space-y-1.5">
                    {qaAns.sources.map((s, i) => (
                      <li key={i} className="text-xs text-[color:var(--muted)]"><span className="font-semibold text-[color:var(--foreground)]">{s.name}:</span> “{s.snippet}”</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {comparison && (recommending || recommendation || recError) && (
        <section className="mt-10">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--accent)] bg-[color:var(--soft-accent)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{r.title}</p>
            {recommending && !recommendation && !recError ? (
              <p className="mt-2 text-sm text-[color:var(--muted)]">{r.thinking}</p>
            ) : recError ? (
              <p className="mt-2 text-sm text-amber-400/80">{r.recError}</p>
            ) : recommendation ? (
              <>
                {recommendation.winnerId && (
                  <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    ✅ {r.recommended}：{resolveDocName(comparison.documents, recommendation.winnerId)}
                  </p>
                )}
                {recommendation.headline && <p className="mt-1 text-sm text-[color:var(--foreground)]">{recommendation.headline}</p>}
                {recommendation.reasons.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-[color:var(--muted)]">
                    {recommendation.reasons.map((why, i) => (
                      <li key={i}>· {why}</li>
                    ))}
                  </ul>
                )}
                {recommendation.perDoc.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {recommendation.perDoc.map((p) => (
                      <div key={p.id} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">
                          {resolveDocName(comparison.documents, p.id)}
                        </p>
                        {p.pros.length > 0 && <p className="mt-1.5 text-[12px] text-[color:var(--accent)]">+ {p.pros.join("；")}</p>}
                        {p.cons.length > 0 && <p className="mt-1 text-[12px] text-amber-400/80">− {p.cons.join("；")}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 border-t border-[color:var(--line)] pt-3 text-[11.5px] leading-5 text-[color:var(--muted)]">{r.disclaimer}</p>
              </>
            ) : null}
          </div>
        </section>
      )}

      {comparison && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{t.comparison}</h2>
          <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--line)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[color:var(--surface-subtle)]">
                  <th className="border-b border-[color:var(--line)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">{t.dimension}</th>
                  {comparison.documents.map((d) => (
                    <th key={d.id} className="border-b border-l border-[color:var(--line)] px-3 py-2 text-left text-xs font-semibold text-[color:var(--foreground)]">{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.dimensions.map((dim) => (
                  <tr key={dim.key} className="align-top">
                    <td className="border-b border-[color:var(--line)] px-3 py-2 font-medium text-[color:var(--muted)]">{dimLabel(dim.key, dim.label)}</td>
                    {comparison.documents.map((d) => {
                      const f = d.fields[dim.key];
                      return (
                        <td key={d.id} className="border-b border-l border-[color:var(--line)] px-3 py-2">
                          {f?.value ? (
                            <>
                              <div className="text-[color:var(--foreground)]">{f.value}</div>
                              {f.source && (
                                <button
                                  type="button"
                                  onClick={() => setTrace({ docId: d.id, docName: d.name, snippet: f.source! })}
                                  title={f.source}
                                  className="mt-0.5 block text-left text-[11px] italic text-[color:var(--faint)] underline decoration-dotted underline-offset-2 transition hover:text-[color:var(--accent)]"
                                >
                                  “{f.source.length > 52 ? `${f.source.slice(0, 52)}…` : f.source}” ↗
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-amber-400/80">{t.notRecognized}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[color:var(--muted)]">{t.tableNote}</p>
          <div className="mt-5">
            {!showSaveTpl ? (
              <button
                type="button"
                onClick={() => { setShowSaveTpl(true); setTplName(""); }}
                className="text-xs font-medium text-[color:var(--accent)] underline underline-offset-2 transition hover:opacity-80"
              >
                {t.tplSave}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  autoFocus
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTemplate(); if (e.key === "Escape") setShowSaveTpl(false); }}
                  placeholder={t.tplNamePlaceholder}
                  className="h-9 min-w-[200px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm text-[color:var(--foreground)]"
                />
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={tplSaving || !tplName.trim()}
                  className="h-9 rounded-[var(--radius)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {tplSaving ? t.tplSaving : t.tplConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveTpl(false)}
                  className="text-xs text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                >
                  {t.tplCancel}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {comparing && !comparison && (
        <div className="mt-10 space-y-6" aria-busy="true">
          <div className="animate-pulse rounded-[var(--radius-lg)] border border-[color:var(--accent)] bg-[color:var(--soft-accent)] p-5">
            <div className="h-3 w-24 rounded bg-[color:var(--accent)]/20" />
            <div className="mt-3 h-6 w-52 rounded bg-[color:var(--accent)]/20" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded bg-[color:var(--accent)]/20" />
              <div className="h-4 w-5/6 rounded bg-[color:var(--accent)]/20" />
              <div className="h-4 w-4/6 rounded bg-[color:var(--accent)]/20" />
            </div>
          </div>
          <div className="animate-pulse overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--line)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[color:var(--surface-subtle)]">
                  {[0, 1, 2, 3].map((i) => (
                    <th key={i} className="border-b border-[color:var(--line)] px-3 py-2.5">
                      <div className="h-3 w-20 rounded bg-[color:var(--surface)]" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    {[0, 1, 2, 3].map((j) => (
                      <td key={j} className="border-b border-[color:var(--line)] px-3 py-3">
                        <div className={`h-4 rounded bg-[color:var(--surface-subtle)] ${j === 0 ? "w-24" : "w-full"}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!comparison && !comparing && (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{t.comingNext}</p>
          <ul className="mt-2 space-y-1 text-sm text-[color:var(--muted)]">
            {t.next.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </div>
      )}

      {trace &&
        (() => {
          const docText = results.find((d) => d.id === trace.docId)?.text ?? "";
          const loc = locateSnippet(docText, trace.snippet);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setTrace(null)}>
              <div role="dialog" aria-modal="true" aria-labelledby="trace-dialog-title" className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
                  <p id="trace-dialog-title" className="text-sm font-semibold text-[color:var(--foreground)]">
                    {tr.source} · {trace.docName}
                  </p>
                  <button type="button" onClick={() => setTrace(null)} autoFocus aria-label="Close" className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
                    ✕
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-[13px] leading-6 text-[color:var(--muted)]">
                  {loc.found ? (
                    <p>
                      {loc.before}
                      <mark className="rounded bg-[color:var(--accent)] px-1 text-white">{loc.match}</mark>
                      {loc.after}
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-[11px] text-amber-400/80">{tr.notLocated}</p>
                      <p>{docText}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="compare" locale={locale} />}
    </Wrapper>
  );
}

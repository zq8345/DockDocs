"use client";

import { toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

export type ValueZoneType = "client" | "ai" | "server";

const CLIENT: Record<Exclude<Locale, "zh-Hant">, string> = {
  en: "Processed in your browser — open F12 → Network to verify: zero upload.",
  zh: "在你的浏览器里处理 — 打开 F12 → 网络面板自验:零上传。",
  es: "Procesado en tu navegador — abre F12 → Red para verificar: cero carga.",
  pt: "Processado no seu navegador — abra F12 → Rede para verificar: zero envio.",
  fr: "Traité dans votre navigateur — ouvrez F12 → Réseau pour vérifier : aucun envoi.",
  ja: "ブラウザ内で処理 — F12 → ネットワークで確認:ゼロアップロード。",
  de: "Im Browser verarbeitet — F12 → Netzwerk öffnen zum Prüfen: kein Upload.",
  ko: "브라우저에서 처리 — F12 → 네트워크 탭으로 확인: 업로드 없음.",
};

const AI: Record<Exclude<Locale, "zh-Hant">, string> = {
  en: "Answers cite their source — click to verify. File read in your browser; only extracted text is sent.",
  zh: "答案标出处、可点击核对。文件在浏览器读取,仅提取的文字发去分析。",
  es: "Las respuestas citan su fuente — haz clic para verificar. Archivo leído en tu navegador; solo se envía el texto extraído.",
  pt: "As respostas citam a fonte — clique para verificar. Arquivo lido no navegador; apenas o texto extraído é enviado.",
  fr: "Les réponses citent leur source — cliquez pour vérifier. Fichier lu dans votre navigateur ; seul le texte extrait est envoyé.",
  ja: "回答は出典を引用 — クリックして確認できます。ファイルはブラウザで読み込み、抽出テキストのみ送信されます。",
  de: "Antworten zitieren ihre Quelle — anklicken zum Prüfen. Datei im Browser gelesen; nur der extrahierte Text wird gesendet.",
  ko: "답변은 출처를 인용 — 클릭하여 확인하세요. 파일은 브라우저에서 읽으며, 추출된 텍스트만 전송됩니다.",
};

const SERVER: Record<Exclude<Locale, "zh-Hant">, string> = {
  en: "Deterministic conversion · layout and formatting preserved.",
  zh: "确定性转换 · 保留排版格式。",
  es: "Conversión determinista · diseño y formato conservados.",
  pt: "Conversão determinística · layout e formatação preservados.",
  fr: "Conversion déterministe · mise en page et formatage préservés.",
  ja: "確定的な変換 · レイアウトと書式を保持。",
  de: "Deterministische Konvertierung · Layout und Formatierung erhalten.",
  ko: "결정적 변환 · 레이아웃 및 서식 보존.",
};

function getText(type: ValueZoneType, locale: Locale): string {
  const map = type === "client" ? CLIENT : type === "ai" ? AI : SERVER;
  if (locale === "zh-Hant") return toHant(map["zh"]);
  return map[locale] ?? map["en"];
}

export function WorkspaceValueZone({
  type,
  locale = "en",
  className,
}: {
  type: ValueZoneType;
  locale?: Locale;
  className?: string;
}) {
  return (
    <p className={`mt-3 text-center text-[11.5px] leading-[1.55] text-[color:var(--muted)] ${className ?? ""}`}>
      {getText(type, locale)}
    </p>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { authHeader } from "@/lib/supabase";
import { deepHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";

const STR = {
  en: {
    title: "Convert a web page to PDF",
    subtitle: "Paste a public URL and download it as a clean PDF — rendered with a real browser engine. No upload, no install.",
    label: "Page URL",
    placeholder: "https://example.com/article",
    convert: "Convert to PDF",
    working: "Rendering the page…",
    done: "Done — your PDF was downloaded.",
    again: "Convert another",
    errInvalid: "Enter a full URL starting with http:// or https://.",
    errFailed: "Could not start the conversion. Please try again.",
    errConvert: "Couldn't render that page. It may block automated access or require sign-in.",
    errTimeout: "The page took too long to render. Try a simpler or lighter page.",
    note: "Best for public, self-contained pages. Pages behind a login or that rely heavily on scripts may not render fully.",
    faqTitle: "Web page to PDF — questions",
    faqs: [
      ["How does it work?", "Paste a URL and we render the page to a PDF using CloudConvert's browser engine, then download it to your device."],
      ["Which pages work best?", "Public, mostly-static pages (articles, docs, invoices). Pages requiring login or heavy JavaScript may not render fully."],
      ["Is it free?", "Yes — converting a web page to PDF is free."],
    ] as const,
  },
  zh: {
    title: "网页转 PDF",
    subtitle: "粘贴一个公开网址，用真实浏览器引擎渲染成干净的 PDF 下载——无需上传、无需安装。",
    label: "网页地址",
    placeholder: "https://example.com/article",
    convert: "转换为 PDF",
    working: "正在渲染网页…",
    done: "完成——PDF 已下载。",
    again: "再转一个",
    errInvalid: "请输入以 http:// 或 https:// 开头的完整网址。",
    errFailed: "无法启动转换，请重试。",
    errConvert: "无法渲染该网页：它可能屏蔽了自动访问，或需要登录。",
    errTimeout: "网页渲染超时，请换一个更简单/更轻的页面。",
    note: "最适合公开、自包含的页面。需要登录或高度依赖脚本的页面可能无法完整渲染。",
    faqTitle: "网页转 PDF 常见问题",
    faqs: [
      ["如何工作？", "粘贴网址后，我们用 CloudConvert 的浏览器引擎把页面渲染成 PDF，再下载到你的设备。"],
      ["哪些页面效果最好？", "公开、以静态为主的页面（文章、文档、发票）。需要登录或高度依赖 JavaScript 的页面可能无法完整渲染。"],
      ["免费吗？", "免费——网页转 PDF 不收费。"],
    ] as const,
  },
  es: {
    title: "Convierte una página web a PDF",
    subtitle: "Pega una URL pública y descárgala como un PDF limpio, renderizado con un motor de navegador real. Sin subir archivos ni instalar nada.",
    label: "URL de la página",
    placeholder: "https://example.com/article",
    convert: "Convertir a PDF",
    working: "Renderizando la página…",
    done: "Listo: tu PDF se descargó.",
    again: "Convertir otra",
    errInvalid: "Ingresa una URL completa que empiece con http:// o https://.",
    errFailed: "No se pudo iniciar la conversión. Inténtalo de nuevo.",
    errConvert: "No se pudo renderizar esa página. Puede que bloquee el acceso automatizado o que requiera iniciar sesión.",
    errTimeout: "La página tardó demasiado en renderizarse. Prueba con una página más simple o ligera.",
    note: "Funciona mejor con páginas públicas y autónomas. Las páginas detrás de un inicio de sesión o que dependen mucho de scripts podrían no renderizarse por completo.",
    faqTitle: "Página web a PDF: preguntas frecuentes",
    faqs: [
      ["¿Cómo funciona?", "Pega una URL y renderizamos la página a un PDF con el motor de navegador de CloudConvert; luego se descarga en tu dispositivo."],
      ["¿Qué páginas funcionan mejor?", "Páginas públicas y en su mayoría estáticas (artículos, documentos, facturas). Las páginas que requieren iniciar sesión o que usan mucho JavaScript podrían no renderizarse por completo."],
      ["¿Es gratis?", "Sí: convertir una página web a PDF es gratis."],
    ] as const,
  },
  pt: {
    title: "Converter página web em PDF",
    subtitle: "Cole uma URL pública e baixe-a como um PDF limpo — renderizado com um motor de navegador real. Sem upload, sem instalação.",
    label: "URL da página",
    placeholder: "https://example.com/article",
    convert: "Converter para PDF",
    working: "Renderizando a página…",
    done: "Pronto — seu PDF foi baixado.",
    again: "Converter outra",
    errInvalid: "Digite uma URL completa começando com http:// ou https://.",
    errFailed: "Não foi possível iniciar a conversão. Tente novamente.",
    errConvert: "Não foi possível renderizar essa página. Ela pode bloquear acesso automatizado ou exigir login.",
    errTimeout: "A página demorou demais para renderizar. Tente uma página mais simples ou leve.",
    note: "Funciona melhor com páginas públicas e autossuficientes. Páginas com login ou que dependem muito de scripts podem não renderizar completamente.",
    faqTitle: "Página web para PDF: perguntas frequentes",
    faqs: [
      ["Como funciona?", "Cole uma URL e renderizamos a página em PDF usando o motor de navegador do CloudConvert; depois é baixado para o seu dispositivo."],
      ["Quais páginas funcionam melhor?", "Páginas públicas e principalmente estáticas (artigos, documentos, faturas). Páginas que exigem login ou usam muito JavaScript podem não renderizar completamente."],
      ["É gratuito?", "Sim — converter uma página web em PDF é gratuito."],
    ] as const,
  },
  fr: {
    title: "Convertir une page web en PDF",
    subtitle: "Collez une URL publique et téléchargez-la en PDF propre — rendu par un vrai moteur de navigateur. Sans upload, sans installation.",
    label: "URL de la page",
    placeholder: "https://example.com/article",
    convert: "Convertir en PDF",
    working: "Rendu de la page en cours…",
    done: "Terminé — votre PDF a été téléchargé.",
    again: "Convertir une autre",
    errInvalid: "Saisissez une URL complète commençant par http:// ou https://.",
    errFailed: "Impossible de lancer la conversion. Veuillez réessayer.",
    errConvert: "Impossible d'afficher cette page. Elle bloque peut-être l'accès automatisé ou nécessite une connexion.",
    errTimeout: "La page a mis trop longtemps à s'afficher. Essayez une page plus simple ou plus légère.",
    note: "Idéal pour les pages publiques et autonomes. Les pages nécessitant une connexion ou reposant fortement sur des scripts peuvent ne pas s'afficher entièrement.",
    faqTitle: "Page web en PDF — questions fréquentes",
    faqs: [
      ["Comment ça fonctionne ?", "Collez une URL et nous affichons la page en PDF grâce au moteur de navigateur de CloudConvert, puis le fichier est téléchargé sur votre appareil."],
      ["Quelles pages fonctionnent le mieux ?", "Les pages publiques et majoritairement statiques (articles, documentation, factures). Les pages nécessitant une connexion ou utilisant beaucoup de JavaScript peuvent ne pas s'afficher entièrement."],
      ["Est-ce gratuit ?", "Oui — convertir une page web en PDF est gratuit."],
    ] as const,
  },
  ja: {
    title: "ウェブページを PDF に変換",
    subtitle: "公開 URL を貼り付けるだけで、本物のブラウザエンジンでレンダリングしたきれいな PDF をダウンロードできます。アップロードもインストールも不要。",
    label: "ページの URL",
    placeholder: "https://example.com/article",
    convert: "PDF に変換",
    working: "ページをレンダリング中…",
    done: "完了 — PDF をダウンロードしました。",
    again: "別のページを変換",
    errInvalid: "http:// または https:// で始まる完全な URL を入力してください。",
    errFailed: "変換を開始できませんでした。再試行してください。",
    errConvert: "そのページをレンダリングできませんでした。自動アクセスをブロックしているか、サインインが必要な可能性があります。",
    errTimeout: "ページのレンダリングに時間がかかりすぎました。よりシンプルで軽いページをお試しください。",
    note: "公開された自己完結型のページに最適です。ログインが必要なページやスクリプトに大きく依存するページは完全にレンダリングされない場合があります。",
    faqTitle: "ウェブページを PDF に — よくある質問",
    faqs: [
      ["どのように動作しますか？", "URL を貼り付けると、CloudConvert のブラウザエンジンでページを PDF にレンダリングし、お使いのデバイスにダウンロードします。"],
      ["どのページが最適ですか？", "公開された、ほぼ静的なページ（記事、ドキュメント、請求書）。ログインが必要なページや JavaScript を多用するページは完全にレンダリングされない場合があります。"],
      ["無料ですか？", "はい — ウェブページの PDF 変換は無料です。"],
    ] as const,
  },
};

export function UrlToPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const post = async (body: unknown, signal: AbortSignal) => {
    const auth = await authHeader();
    return fetch("/api/cloudconvert-convert", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify(body),
      signal,
    });
  };

  const convert = useCallback(async () => {
    const u = url.trim();
    if (!/^https?:\/\/.+/i.test(u)) {
      setError(t.errInvalid);
      return;
    }
    setError(null);
    setPhase("working");
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const createRes = await post({ action: "create", route: "url-to-pdf", url: u }, ctrl.signal);
      const created = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !created.ok) throw new Error(created.message || t.errFailed);
      const jobId = created.jobId as string;

      const start = Date.now();
      let downloadUrl: string | null = null;
      while (Date.now() - start < 170_000) {
        await new Promise((r) => setTimeout(r, 1800));
        if (ctrl.signal.aborted) return;
        const statusRes = await post({ action: "status", jobId }, ctrl.signal);
        const st = await statusRes.json().catch(() => ({}));
        if (!st.ok && st.code === "CONVERSION_FAILED") throw new Error(t.errConvert);
        if (st.ok && st.status === "finished" && st.downloadUrl) {
          downloadUrl = st.downloadUrl;
          break;
        }
      }
      if (!downloadUrl) throw new Error(t.errTimeout);

      const dl = await fetch(downloadUrl, { signal: ctrl.signal });
      if (!dl.ok) throw new Error(t.errFailed);
      const blob = await dl.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "dockdocs-webpage.pdf";
      a.click();
      URL.revokeObjectURL(href);
      setPhase("done");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setPhase("idle");
        return;
      }
      setError(e instanceof Error ? e.message : String(e));
      setPhase("idle");
    }
  }, [url, t]);

  const reset = () => {
    abortRef.current?.abort();
    setPhase("idle");
    setUrl("");
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <label className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.label}</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" && phase !== "working") convert(); }}
            placeholder={t.placeholder}
            disabled={phase === "working"}
            className="h-11 flex-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[14px] text-[color:var(--foreground)] outline-none focus:border-[color:var(--accent)] disabled:opacity-60"
          />
          {phase === "done" ? (
            <button type="button" onClick={reset} className="inline-flex h-11 shrink-0 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] px-6 text-[14px] font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">
              {t.again}
            </button>
          ) : (
            <button type="button" onClick={convert} disabled={phase === "working" || !url.trim()} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {phase === "working" ? (<><Spinner /> {t.working}</>) : t.convert}
            </button>
          )}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-[color:var(--faint)]">{t.note}</p>
        {phase === "done" && (
          <p className="mt-3 rounded-[var(--radius)] border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)] px-4 py-3 text-[13.5px] text-[#34d399]">{t.done}</p>
        )}
        {error && (
          <p className="mt-3 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</p>
        )}
      </div>

      <div className="mt-12 border-t border-[color:var(--line)] pt-8">
        <h2 className="text-[20px] font-semibold text-[color:var(--foreground)]">{t.faqTitle}</h2>
        <dl className="mt-4 grid gap-5">
          {t.faqs.map(([q, a]) => (
            <div key={q}>
              <dt className="text-[15px] font-semibold text-[color:var(--foreground)]">{q}</dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed text-[color:var(--muted)]">{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

import {
  defaultLocale,
  localizedHref,
  type InfoPageData,
  type Locale,
} from "@/lib/i18n";
import { deepHant, toHant } from "@/lib/zh-hant";
import { LAYOUT } from "@/lib/layout-constants";

type SaasInfoPageProps = {
  page: InfoPageData;
  // ko now renders native Korean chrome/crawl-links (see the ko branches below).
  locale?: "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";
  useLocalePrefix?: boolean;
};

export function SaasInfoPage({
  page,
  locale = defaultLocale,
  useLocalePrefix = false,
}: SaasInfoPageProps) {
  const hant = locale === "zh-Hant";
  // zh-Hant UI strings are the Traditional conversion of the zh copy via OpenCC.
  const zh = locale === "zh" || hant;
  const fr = locale === "fr";
  const ja = locale === "ja";
  const es = locale === "es";
  const pt = locale === "pt";
  const de = locale === "de";
  const ko = locale === "ko";
  const zhT = (s: string) => (hant ? toHant(s) : s);

  // zh links (Simplified); for zh-Hant we run the same array through deepHant.
  const zhCrawlLinks = [
    { label: "PDF 工具", href: "/", description: "返回 DockDocs 首页。" },
    { label: "资源中心", href: "/resources", description: "按工作流浏览 PDF、OCR、转换资源。" },
    { label: "文档指南", href: "/guides", description: "阅读压缩、转换、OCR 工作流指南。" },
    { label: "FAQ", href: "/faq", description: "查看隐私、上传、OCR、AI 问题。" },
  ];
  const crawlLinks = zh
    ? (hant ? deepHant(zhCrawlLinks) : zhCrawlLinks)
    : ja
    ? [
        { label: "PDFツール", href: "/", description: "DockDocs のホームに戻る。" },
        { label: "リソース", href: "/resources", description: "PDF・OCR・変換のリソースを閲覧。" },
        { label: "ガイド", href: "/guides", description: "圧縮・結合・変換のステップ別ガイド。" },
        { label: "よくある質問", href: "/faq", description: "プライバシー・アップロード・OCR・AIの質問。" },
      ]
    : fr
    ? [
        { label: "Outils PDF", href: "/", description: "Retourner à la page d'accueil DockDocs." },
        { label: "Ressources", href: "/resources", description: "Parcourir les ressources PDF, OCR et de conversion." },
        { label: "Guides", href: "/guides", description: "Guides pas à pas sur la compression, la fusion et la conversion." },
        { label: "FAQ", href: "/faq", description: "Questions sur la confidentialité, le téléchargement, l'OCR et l'IA." },
      ]
    : es
    ? [
        { label: "Herramientas PDF", href: "/", description: "Volver a la página de inicio de DockDocs." },
        { label: "Recursos", href: "/resources", description: "Explora recursos de PDF, OCR y conversión." },
        { label: "Guías", href: "/guides", description: "Guías paso a paso de compresión, fusión y conversión." },
        { label: "FAQ", href: "/faq", description: "Consulta preguntas sobre privacidad, subida, OCR e IA." },
      ]
    : pt
    ? [
        { label: "Ferramentas PDF", href: "/", description: "Voltar à página inicial do DockDocs." },
        { label: "Recursos", href: "/resources", description: "Explore recursos de PDF, OCR e conversão." },
        { label: "Guias", href: "/guides", description: "Guias passo a passo de compressão, junção e conversão." },
        { label: "FAQ", href: "/faq", description: "Veja perguntas sobre privacidade, envio, OCR e IA." },
      ]
    : de
    ? [
        { label: "PDF-Tools", href: "/", description: "Zurück zur DockDocs-Startseite." },
        { label: "Ressourcen", href: "/resources", description: "PDF-, OCR- und Konvertierungsressourcen durchsuchen." },
        { label: "Anleitungen", href: "/guides", description: "Schritt-für-Schritt-Anleitungen zu Komprimierung, Zusammenführung und Konvertierung." },
        { label: "FAQ", href: "/faq", description: "Fragen zu Datenschutz, Upload, OCR und KI ansehen." },
      ]
    : ko
    ? [
        { label: "PDF 도구", href: "/", description: "DockDocs 홈으로 돌아갑니다." },
        { label: "리소스", href: "/resources", description: "PDF·OCR·변환 리소스를 둘러보세요." },
        { label: "가이드", href: "/guides", description: "압축·병합·변환 단계별 가이드." },
        { label: "자주 묻는 질문", href: "/faq", description: "프라이버시·업로드·OCR·AI 관련 질문을 확인하세요." },
      ]
    : [
        { label: "PDF Tools", href: "/", description: "Return to the DockDocs homepage." },
        { label: "Resources", href: "/resources", description: "Browse PDF, OCR, and conversion resources." },
        { label: "Guides", href: "/guides", description: "Step-by-step compression, merge, and conversion guides." },
        { label: "FAQ", href: "/faq", description: "Review privacy, upload, OCR, and AI questions." },
      ];

  const faqSchema = page.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      {/* Hero */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className={`mx-auto ${LAYOUT.content} px-5 py-14 sm:px-6 sm:py-20`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[color:var(--foreground)] sm:text-4xl">
            {page.heroTitle}
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
            {page.heroDescription}
          </p>
          {(page.primaryAction || page.secondaryAction) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {page.primaryAction ? (
                <a
                  href={localizedHref(page.primaryAction.href, locale, useLocalePrefix)}
                  className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {page.primaryAction.label}
                </a>
              ) : null}
              {page.secondaryAction ? (
                <a
                  href={localizedHref(page.secondaryAction.href, locale, useLocalePrefix)}
                  className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                >
                  {page.secondaryAction.label}
                </a>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Content sections */}
      {page.sections.map((section) => (
        <section key={section.title} className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className={`mx-auto ${LAYOUT.content} px-5 py-12 sm:px-6`}>
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-[color:var(--foreground)]">
              {section.title}
            </h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">
              {section.description}
            </p>
            {section.items?.length ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5"
                  >
                    <h3 className="text-[15px] font-semibold text-[color:var(--foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}

      {/* FAQ */}
      {page.faqs?.length ? (
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className={`mx-auto ${LAYOUT.content} px-5 py-12 sm:px-6`}>
            <div className="divide-y divide-[color:var(--line)]">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[color:var(--foreground)]">
                    {faq.question}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--muted)] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Continue exploring */}
      <section className="bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {zh ? zhT("继续探索") : fr ? "Continuer à explorer" : ja ? "さらに探す" : es ? "Seguir explorando" : pt ? "Continuar explorando" : de ? "Weiter entdecken" : ko ? "계속 살펴보기" : "Continue exploring"}
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
            {zh ? zhT("相关工具、指南和支持") : fr ? "Outils, guides et assistance connexes" : ja ? "関連ツール・ガイド・サポート" : es ? "Herramientas, guías y soporte relacionados" : pt ? "Ferramentas, guias e suporte relacionados" : de ? "Verwandte Tools, Anleitungen und Support" : ko ? "관련 도구, 가이드, 지원" : "Related tools, guides, and support"}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {crawlLinks.map((link) => (
              <a
                key={link.href}
                href={localizedHref(link.href, locale, useLocalePrefix)}
                className="group rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)]"
              >
                <h3 className="text-[15px] font-semibold text-[color:var(--foreground)]">{link.label}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{link.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-[color:var(--accent)] transition group-hover:translate-x-0.5">
                  {zh ? zhT("打开页面 →") : fr ? "Ouvrir la page →" : ja ? "ページを開く →" : es ? "Abrir página →" : pt ? "Abrir página →" : de ? "Seite öffnen →" : ko ? "페이지 열기 →" : "Open page →"}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

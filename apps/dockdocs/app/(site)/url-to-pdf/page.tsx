import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page (how-to / question format). Same model
// as /compress-pdf-without-uploading and /safe-to-upload-pdf: NOT in routeSlugs (no
// localized variants yet), single en URL in sitemap.ts standaloneContentRoutes +
// check-i18n-parity EXCEPTIONS. The old /url-to-pdf TOOL (CloudConvert capture-website)
// was retired — it uploaded the URL to a server, couldn't reach pages behind a login,
// and silently failed on JS-heavy / bot-protected (Cloudflare) sites. This page tells
// the honest truth: the browser's built-in Print -> Save as PDF is the best method,
// then funnels to DockDocs' real tools for the resulting PDF. The 6 old localized
// tool routes (/<lng>/url-to-pdf) 301 here via public/_redirects.

const url = `${siteUrl}/url-to-pdf/`;

export const metadata: Metadata = {
  title: "URL to PDF — The Best Way to Save a Web Page as a PDF",
  description:
    "The fastest, highest-fidelity way to turn a web page into a PDF is your browser's built-in Print → Save as PDF (Ctrl+P / ⌘P). How to do it, why it beats online URL-to-PDF converters, and what to do with the PDF next.",
  keywords: [
    "url to pdf",
    "save web page as pdf",
    "webpage to pdf",
    "convert url to pdf",
    "print web page to pdf",
  ],
  alternates: { canonical: "/url-to-pdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "URL to PDF — The Best Way to Save a Web Page as a PDF",
    description:
      "Turn any web page into a PDF with your browser's built-in Print → Save as PDF (Ctrl+P / ⌘P) — instant, free, no upload, and it keeps the exact layout you see.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Save a Web Page as a PDF",
  description:
    "The best way to turn a URL into a PDF is your browser's built-in Print → Save as PDF — instant, free, and nothing is uploaded.",
  eyebrow: "How-to",
  heroTitle: "How to save a web page as a PDF",
  heroDescription:
    "The best way to turn any web page into a PDF is already built into your browser: Print → Save as PDF (Ctrl+P, or ⌘P on a Mac). It's instant and free, keeps the exact layout you see, works on pages behind a login, and nothing is uploaded to a server. Here's the step-by-step — plus what to do with the PDF once you have it.",
  primaryAction: { label: "Open Compress PDF", href: "/compress-pdf" },
  secondaryAction: { label: "Merge several PDFs", href: "/merge-pdf" },
  sections: [
    {
      title: "The fastest way: Print → Save as PDF",
      description:
        "1. Open the web page you want to save. 2. Press Ctrl+P (Windows/Linux) or ⌘P (Mac) — or use the browser menu → Print. 3. Under \"Destination\" (or \"Printer\"), choose \"Save as PDF\". 4. Click Save and pick where to put the file. That's it — the PDF is rendered by the same browser that's showing you the page, so it looks exactly like what's on screen, and the page never leaves your computer.",
    },
    {
      title: "Get a cleaner PDF (margins, background, reader mode)",
      description:
        "In the print dialog's \"More settings\": turn on \"Background graphics\" to keep colors and shading; switch to Landscape for wide tables; set Margins to None for an edge-to-edge capture; and use Paper size A4/Letter to control pagination. For a clutter-free result, open the page in your browser's Reader/Reading view first (or a \"print-friendly\" link if the site offers one), then print to PDF — you'll drop the ads, nav bars, and sidebars.",
    },
    {
      title: "Why this beats online \"URL to PDF\" converters",
      description:
        "An online URL-to-PDF service sends the address to a server, which loads the page with its own headless browser and sends a PDF back. That means it can't see anything behind a login or paywall, often renders JavaScript-heavy pages blank or half-loaded, and is refused outright by bot-protected sites (e.g. Cloudflare challenge pages). Your own browser has none of those limits: it's already authenticated, already rendered the page, and produces the PDF locally with full fidelity and zero upload.",
    },
    {
      title: "What to do with the PDF next — where DockDocs fits",
      description:
        "Once you've saved the page as a PDF, DockDocs' tools take it from there — and the file-processing ones run right in your browser.",
      items: [
        {
          title: "Compress it if it's large",
          description:
            "Image-heavy pages can save big. Compress PDF runs in your browser to shrink the file before you email or archive it.",
        },
        {
          title: "Merge several saved pages",
          description:
            "Saved a few pages of a doc or a multi-part article? Merge PDF combines them into one file, in the order you choose.",
        },
        {
          title: "Add page numbers or make it searchable",
          description:
            "Add Page Numbers stamps a clean sequence; if you saved a scan or image-only capture, OCR makes the text selectable and searchable.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What's the best way to convert a URL to PDF?",
      answer:
        "Use your browser's built-in Print → Save as PDF (Ctrl+P on Windows/Linux, ⌘P on Mac, then choose \"Save as PDF\"). It's free, instant, keeps the exact layout you see, works on pages behind a login, and never uploads the page to a server.",
    },
    {
      question: "How do I save a web page as a PDF on Windows or Mac?",
      answer:
        "On Windows or Linux, press Ctrl+P; on a Mac, press ⌘P. In the print dialog, set the destination to \"Save as PDF\" and click Save. Every modern browser — Chrome, Edge, Firefox, Safari — can do this with no extension or app.",
    },
    {
      question: "Why are the background colors or images missing in my PDF?",
      answer:
        "By default the print dialog drops page backgrounds to save ink. Open \"More settings\" and turn on \"Background graphics\" (Chrome/Edge) or \"Print backgrounds\" (Firefox/Safari) before you save, and the colors and shading will be included.",
    },
    {
      question: "Can I save a page that's behind a login?",
      answer:
        "Yes — because your browser is already signed in, Print → Save as PDF captures exactly what you can see, including pages behind a login or paywall. An online URL-to-PDF service can't do this, since it loads the page from its own server without your session.",
    },
    {
      question: "Does DockDocs convert a URL to PDF for me?",
      answer:
        "We don't — and we'd rather be honest about why: your own browser's Print → Save as PDF gives a better result than any server-side URL-to-PDF converter (full fidelity, pages behind a login, no upload). What DockDocs does is help with the PDF afterwards — compress it, merge several saved pages, add page numbers, or OCR a scanned capture.",
    },
    {
      question: "Is it free?",
      answer:
        "Yes. Print → Save as PDF is built into every browser at no cost, and the DockDocs tools for working with the resulting PDF — compress, merge, page numbers, OCR — are free to use too.",
    },
  ],
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "How to Save a Web Page as a PDF",
      description:
        "The best way to turn a URL into a PDF is your browser's built-in Print → Save as PDF (Ctrl+P / ⌘P) — instant, free, full-fidelity, and no upload. How to do it, why it beats online converters, and what to do with the PDF next.",
      inLanguage: "en",
      about: { "@id": `${siteUrl}#org` },
      isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
      publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "How to save a web page as a PDF", item: url },
      ],
    },
  ],
};

export default function UrlToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SaasInfoPage page={page} />
    </>
  );
}

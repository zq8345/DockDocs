// "Verify it yourself" trust block for tools whose processing is 100% in the
// browser — the file and its content never leave the device (no server upload).
//
// HONESTY GATE: this block makes a verifiable claim ("your file is never
// uploaded"), so it must ONLY render on tools audited to upload nothing. The
// template gates on LOCAL_ONLY_SLUGS; custom-client tools import the component
// directly (each verified pure-client). Audit 2026-06-17: every slug here was
// traced to a pdf-lib / pdfjs / canvas / Tesseract-WASM runtime with no fetch of
// user data — only static same-origin asset loads (workers, fonts, wasm). Server
// conversions (/api/cloudconvert-convert, gotenberg, reverse-convert) and AI
// tools (which POST extracted text) are deliberately EXCLUDED.

// Every pure-client tool, by the value its render path gates on. Two gates share
// this one set because the render paths never overlap:
//  • the shared template (PdfToolPage) gates on config.slug → matches the 7
//    template-rendered tools below;
//  • ToolFaq gates on its `tool` prop → matches the 14 custom-client tools (each
//    custom client renders <ToolFaq tool="…"/>; the image clients pass the hub
//    slug pdf-to-image / images-to-pdf for all their format routes).
// No value is reachable by both gates, so a single set is unambiguous.
export const LOCAL_ONLY_SLUGS = new Set<string>([
  // template-rendered (PdfToolPage, gated on config.slug)
  "compress-pdf",
  "protect-pdf",
  "unlock-pdf",
  "ocr-pdf",
  "pdf-to-text",
  "pdf-to-html",
  "pdf-to-markdown",
  // custom clients (gated on ToolFaq tool prop)
  "merge-pdf",
  "split-pdf",
  "rotate-page",
  "delete-page",
  "reorder-pages",
  "add-page",
  "pdf-to-image",
  "images-to-pdf",
  "crop-pdf",
  "redact-pdf",
  "sign-pdf",
  "redline",
  "watermark-pdf",
  "page-numbers",
]);

type Loc = "en" | "zh" | "es" | "pt" | "fr" | "ja";
const LOCS: readonly Loc[] = ["en", "zh", "es", "pt", "fr", "ja"];

const COPY: Record<Loc, { title: string; body: string; how: string }> = {
  en: {
    title: "Don't take our word for it — verify it",
    body: "This tool runs entirely in your browser. Your file never leaves your device — it isn't uploaded to any server.",
    how: "Check for yourself: open your browser's developer tools (F12, or right-click → Inspect) → the Network tab → then run this tool. You won't see your file uploaded anywhere, because the work happens locally on your device.",
  },
  zh: {
    title: "别只听我们说——自己验证",
    body: "这个工具完全在你的浏览器里运行。你的文件不会离开你的设备，也不会上传到任何服务器。",
    how: "自己核实：打开浏览器的开发者工具（F12，或右键 → 检查）→ 切到「Network / 网络」标签 → 再运行这个工具。你不会看到文件被上传到任何地方——处理就发生在你本地的设备上。",
  },
  es: {
    title: "No nos creas a nosotros — compruébalo",
    body: "Esta herramienta funciona completamente en tu navegador. Tu archivo nunca sale de tu dispositivo: no se sube a ningún servidor.",
    how: "Compruébalo tú mismo: abre las herramientas de desarrollo del navegador (F12, o clic derecho → Inspeccionar) → la pestaña «Network / Red» → y ejecuta esta herramienta. No verás que tu archivo se suba a ningún sitio, porque el trabajo ocurre localmente en tu dispositivo.",
  },
  pt: {
    title: "Não acredite só na nossa palavra — verifique",
    body: "Esta ferramenta funciona inteiramente no seu navegador. Seu arquivo nunca sai do seu dispositivo: não é enviado a nenhum servidor.",
    how: "Verifique você mesmo: abra as ferramentas de desenvolvedor do navegador (F12, ou clique com o botão direito → Inspecionar) → a aba «Network / Rede» → e execute esta ferramenta. Você não verá seu arquivo sendo enviado a lugar nenhum, porque o processamento acontece localmente no seu dispositivo.",
  },
  fr: {
    title: "Ne nous croyez pas sur parole — vérifiez",
    body: "Cet outil fonctionne entièrement dans votre navigateur. Votre fichier ne quitte jamais votre appareil : il n'est envoyé à aucun serveur.",
    how: "Vérifiez par vous-même : ouvrez les outils de développement du navigateur (F12, ou clic droit → Inspecter) → l'onglet « Network / Réseau » → puis lancez cet outil. Vous ne verrez votre fichier envoyé nulle part, car le traitement se fait localement sur votre appareil.",
  },
  ja: {
    title: "言葉だけでなく、自分で確かめてください",
    body: "このツールはすべてブラウザ内で動作します。あなたのファイルが端末から外に出ることはなく、どのサーバーにもアップロードされません。",
    how: "ご自身で確認できます：ブラウザの開発者ツール（F12、または右クリック →「検証」）を開き →「Network / ネットワーク」タブに切り替えて → このツールを実行してみてください。処理はあなたの端末内でローカルに行われるため、ファイルがどこかにアップロードされる様子は表示されません。",
  },
};

export function VerifyClientSide({ locale = "en" }: { locale?: string }) {
  const c = COPY[(LOCS.includes(locale as Loc) ? locale : "en") as Loc];
  return (
    <section className="mt-12 border-t border-[color:var(--line)] pt-8">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">{c.title}</h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[color:var(--muted)]">{c.body}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--faint)]">{c.how}</p>
      </div>
    </section>
  );
}

"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 30;
const PW_OK = /^[A-Za-z0-9_]{4,32}$/;

const STR = {
  en: {
    title: "Batch encrypt",
    subtitle: "Set one password and lock a whole folder of PDFs — each is encrypted in your browser and packaged into a single ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    pw: "Password", pwPlaceholder: "Password to open the files", show: "Show", hide: "Hide",
    pwRule: "4–32 characters: letters, digits, underscore (_).",
    run: "Encrypt all", running: "Encrypting", download: "Download ZIP", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`, done: "encrypted", failed: "failed",
    needFile: "Add at least one PDF.", needPw: "Enter a valid password (4–32: letters, digits, underscore).",
    note: "Each PDF will require this password to open. Already-encrypted PDFs are skipped. Everything stays on your device.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量 PDF 加密",
    subtitle: "设一个密码，给整个文件夹的 PDF 加密——每个都在浏览器中加密并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    pw: "密码", pwPlaceholder: "打开文件所需的密码", show: "显示", hide: "隐藏",
    pwRule: "4–32 位：字母、数字、下划线(_)。",
    run: "全部加密", running: "加密中", download: "下载 ZIP", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`, done: "已加密", failed: "失败",
    needFile: "至少添加一份 PDF。", needPw: "请输入有效密码(4–32 位：字母、数字、下划线)。",
    note: "每份 PDF 都将需要此密码才能打开。已加密的 PDF 会被跳过。全部在你的设备上完成。",
    err: "出错了：",
  },
  es: {
    title: "Cifrar por lotes",
    subtitle: "Define una sola contraseña y bloquea una carpeta entera de PDF: cada uno se cifra en tu navegador y se empaqueta en un único ZIP. No se sube nada.",
    drop: "Arrastra y suelta los PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    pw: "Contraseña", pwPlaceholder: "Contraseña para abrir los archivos", show: "Mostrar", hide: "Ocultar",
    pwRule: "De 4 a 32 caracteres: letras, dígitos y guion bajo (_).",
    run: "Cifrar todo", running: "Cifrando", download: "Descargar ZIP", reset: "Empezar de nuevo",
    files: (n: number) => `${n} / ${MAX_FILES} archivos`, done: "cifrado", failed: "error",
    needFile: "Agrega al menos un PDF.", needPw: "Ingresa una contraseña válida (de 4 a 32: letras, dígitos y guion bajo).",
    note: "Cada PDF requerirá esta contraseña para abrirse. Los PDF que ya están cifrados se omiten. Todo permanece en tu dispositivo.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Criptografar em lote",
    subtitle: "Defina uma senha e bloqueie uma pasta inteira de PDFs: cada um é criptografado no seu navegador e empacotado em um único ZIP. Nada é enviado.",
    drop: "Arraste e solte os PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    pw: "Senha", pwPlaceholder: "Senha para abrir os arquivos", show: "Mostrar", hide: "Ocultar",
    pwRule: "De 4 a 32 caracteres: letras, dígitos e sublinhado (_).",
    run: "Criptografar tudo", running: "Criptografando", download: "Baixar ZIP", reset: "Recomeçar",
    files: (n: number) => `${n} / ${MAX_FILES} arquivos`, done: "criptografado", failed: "erro",
    needFile: "Adicione pelo menos um PDF.", needPw: "Insira uma senha válida (4 a 32: letras, dígitos e sublinhado).",
    note: "Cada PDF exigirá esta senha para ser aberto. PDFs já criptografados são ignorados. Tudo permanece no seu dispositivo.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Chiffrement en lot",
    subtitle: "Définissez un seul mot de passe et verrouillez un dossier entier de PDF : chacun est chiffré dans votre navigateur et regroupé dans un unique ZIP. Rien n'est envoyé.",
    drop: "Faites glisser vos PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier",
    pw: "Mot de passe", pwPlaceholder: "Mot de passe pour ouvrir les fichiers", show: "Afficher", hide: "Masquer",
    pwRule: "De 4 à 32 caractères : lettres, chiffres et trait de soulignement (_).",
    run: "Tout chiffrer", running: "Chiffrement en cours", download: "Télécharger le ZIP", reset: "Recommencer",
    files: (n: number) => `${n} / ${MAX_FILES} fichiers`, done: "chiffré", failed: "échec",
    needFile: "Ajoutez au moins un PDF.", needPw: "Saisissez un mot de passe valide (4 à 32 : lettres, chiffres et trait de soulignement).",
    note: "Chaque PDF nécessitera ce mot de passe pour être ouvert. Les PDF déjà chiffrés sont ignorés. Tout reste sur votre appareil.",
    err: "Une erreur est survenue : ",
  },
};

export function BatchProtectClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null); setPhase("idle");
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, MAX_FILES));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.needFile); return; }
    if (!PW_OK.test(password)) { setError(t.needPw); return; }
    setPhase("running"); setError(null); setProgress(0);
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const artifact = await runPdfRuntime({
          slug: "protect-pdf",
          files: [it.file],
          pageRanges: password, // protect-pdf reads the password from pageRanges
          outputFileName: it.name.replace(/\.pdf$/i, "") + "-protected.pdf",
          locale: locale === "zh" ? "zh" : "en",
        });
        updated[i] = { ...it, status: "done", blob: artifact.blob };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, password, locale, t]);

  const download = async () => {
    const done = items.filter((it) => it.status === "done" && it.blob);
    if (!done.length) return;
    try {
      const entries = await Promise.all(done.map(async (it) => ({ name: it.name.replace(/\.pdf$/i, "") + "-protected.pdf", data: new Uint8Array(await it.blob!.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-protected.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(locale === "zh" ? "打包下载失败，请重试。" : "Could not build the download — please try again.");
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <label className="block text-[12.5px] font-medium text-[color:var(--muted)]">{t.pw}</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.pwPlaceholder} maxLength={32}
                  className="h-10 w-full max-w-xs rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[14px] text-[color:var(--foreground)]"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="h-10 rounded-[var(--radius)] border border-[color:var(--line)] px-3 text-[12.5px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{showPw ? t.hide : t.show}</button>
              </div>
              <p className="mt-1 text-[11.5px] text-[color:var(--faint)]">{t.pwRule}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              {items.length < MAX_FILES && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && doneCount > 0 ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{items.length}</>) : t.run}</button>
              )}
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2.5 text-[13.5px]">
                <span className="truncate font-medium text-[color:var(--foreground)]" title={it.name}>{it.name}</span>
                <span className="shrink-0 text-[12.5px]">
                  {it.status === "done" ? <span className="text-[#34d399]">🔒 {t.done}</span>
                    : it.status === "error" ? <span className="text-[#f87171]" title={it.msg}>{t.failed}</span>
                      : <span className="text-[color:var(--faint)]">·</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-protect-pdf" locale={locale} />
    </div>
  );
}

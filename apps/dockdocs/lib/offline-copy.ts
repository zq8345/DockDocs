// Honest offline copy for the PWA — shown by the offline banner (PwaRuntime) and the
// /offline fallback page (OfflineFallback). The wedge: browser-based tools keep working
// offline (their files never needed a server), while AI + file conversion upload, so they
// honestly need a connection. Translations are best-effort — flag 多语言 for native polish.
export type OfflineLocale = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja" | "de";

type OfflineStrings = { title: string; body: string; retry: string; banner: string };

export const OFFLINE_COPY: Record<OfflineLocale, OfflineStrings> = {
  en: {
    title: "You're offline",
    body: "Browser-based tools — compress, merge, sign, encrypt, page edits — still work, because those files never needed a server. AI and file conversion need a connection; reconnect to use them.",
    retry: "Retry",
    banner: "Offline — browser tools still work; AI & conversion need a connection.",
  },
  zh: {
    title: "你已离线",
    body: "在浏览器内运行的工具——压缩、合并、签名、加密、页面编辑——仍可使用，因为这些文件本就不需要服务器。AI 和文件转换需要联网，恢复连接后即可使用。",
    retry: "重试",
    banner: "已离线——浏览器工具仍可用；AI 与文件转换需要联网。",
  },
  "zh-Hant": {
    title: "你已離線",
    body: "在瀏覽器內執行的工具——壓縮、合併、簽名、加密、頁面編輯——仍可使用，因為這些檔案本就不需要伺服器。AI 和檔案轉換需要連網，恢復連線後即可使用。",
    retry: "重試",
    banner: "已離線——瀏覽器工具仍可用；AI 與檔案轉換需要連網。",
  },
  es: {
    title: "Estás sin conexión",
    body: "Las herramientas que se ejecutan en el navegador —comprimir, combinar, firmar, cifrar, editar páginas— siguen funcionando, porque esos archivos nunca necesitaron un servidor. La IA y la conversión de archivos necesitan conexión; vuelve a conectarte para usarlas.",
    retry: "Reintentar",
    banner: "Sin conexión: las herramientas del navegador funcionan; la IA y la conversión necesitan conexión.",
  },
  pt: {
    title: "Você está offline",
    body: "As ferramentas que rodam no navegador —comprimir, juntar, assinar, criptografar, editar páginas— continuam funcionando, porque esses arquivos nunca precisaram de um servidor. IA e conversão de arquivos precisam de conexão; reconecte-se para usá-las.",
    retry: "Tentar de novo",
    banner: "Offline: as ferramentas do navegador funcionam; IA e conversão precisam de conexão.",
  },
  fr: {
    title: "Vous êtes hors ligne",
    body: "Les outils qui s'exécutent dans le navigateur — compresser, fusionner, signer, chiffrer, modifier les pages — fonctionnent toujours, car ces fichiers n'ont jamais eu besoin d'un serveur. L'IA et la conversion de fichiers nécessitent une connexion ; reconnectez-vous pour les utiliser.",
    retry: "Réessayer",
    banner: "Hors ligne — les outils du navigateur fonctionnent ; l'IA et la conversion nécessitent une connexion.",
  },
  ja: {
    title: "オフラインです",
    body: "ブラウザ内で動作するツール——圧縮・結合・署名・暗号化・ページ編集——は引き続き使えます。これらのファイルはもともとサーバーを必要としないからです。AI とファイル変換にはインターネット接続が必要です。接続を回復してからご利用ください。",
    retry: "再試行",
    banner: "オフライン——ブラウザツールは使えます。AI と変換には接続が必要です。",
  },
  de: {
    title: "Sie sind offline",
    body: "Im Browser laufende Tools — komprimieren, zusammenführen, signieren, verschlüsseln, Seiten bearbeiten — funktionieren weiterhin, denn diese Dateien brauchten nie einen Server. KI und Dateikonvertierung benötigen eine Verbindung; stellen Sie die Verbindung wieder her, um sie zu nutzen.",
    retry: "Erneut versuchen",
    banner: "Offline – Browser-Tools funktionieren; KI und Konvertierung benötigen eine Verbindung.",
  },
};

// Best-effort current locale from what the app already persists / sets, client-side only.
export function detectOfflineLocale(): OfflineLocale {
  if (typeof document === "undefined") return "en";
  let raw = "";
  try {
    raw = (localStorage.getItem("dockdocs-lang") || document.documentElement.lang || "").toLowerCase();
  } catch {
    raw = (document.documentElement.lang || "").toLowerCase();
  }
  if (raw.startsWith("zh-hant") || raw === "zh-tw" || raw === "zh-hk" || raw === "zh-mo") return "zh-Hant";
  const base = raw.split("-")[0];
  const known: OfflineLocale[] = ["en", "zh", "es", "pt", "fr", "ja", "de"];
  return (known.find((l) => l === base) as OfflineLocale | undefined) ?? "en";
}

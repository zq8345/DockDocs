"use client";

import { useEffect, useState } from "react";
import { deepHant } from "@/lib/zh-hant";
import type { AuthoredLocale } from "@/lib/i18n";
import { ProductDemoHero } from "@/components/ProductDemoHero";

// Non-standard browser API: exists at runtime in Chrome/Edge.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Browser = "chromium" | "safari" | "other";
type Locale = AuthoredLocale | "zh-Hant";

const AUTHORED_LOCALES: Locale[] = ["en", "zh", "zh-Hant", "es", "pt", "fr", "ja", "de", "ko"];

const _en = {
  title: "Download DockDocs",
  subtitle: "Install DockDocs on your device for one-click access — or wait for the native desktop app coming soon.",
  pwaLabel: "Web App (PWA)",
  pwaTitle: "Install to your device",
  pwaAvailable: "Available now",
  pwaDesc: "Works on Windows, Mac, iOS, and Android. No app store needed — install directly from your browser.",
  installBtn: "Install DockDocs",
  installedMsg: "DockDocs is already installed on this device.",
  chromiumHeading: "Chrome / Edge",
  chromiumStep1: "Open dockdocs.app in Chrome or Edge",
  chromiumStep2: "Click the install icon (⊕) in the address bar",
  chromiumStep3: "Click \"Install\" — DockDocs opens as its own window",
  safariHeading: "Safari (iOS / macOS)",
  safariStep1: "Open dockdocs.app in Safari",
  safariStep2: "Tap Share (⎙) → \"Add to Home Screen\" (iOS) or \"Add to Dock\" (macOS Sonoma+)",
  safariStep3: "Tap Add — DockDocs appears as an app icon",
  otherHeading: "Other browsers",
  otherNote: "Firefox and most other browsers don't support one-click install. Open this page in Chrome, Edge, or Safari instead.",
  desktopTitle: "Desktop apps",
  desktopComingSoon: "Coming soon",
  windowsExt: ".exe installer",
  macExt: ".dmg installer",
  desktopNote: "The web app covers all functionality and works offline. The desktop app adds OS-level file integration — your files never pass through a browser engine.",
  privacyHeading: "Privacy",
  privacyNote: "Most DockDocs tools process your files locally in your browser — nothing is uploaded to our servers. A few conversion tools use our secure cloud service; files are never stored. The desktop app takes this further: your files never touch a browser engine at all.",
  privacyLink: "Privacy policy →",
};

const COPY = {
  en: _en,
  zh: {
    title: "下载 DockDocs",
    subtitle: "一键将 DockDocs 安装到设备，随时快速启动——或等待即将推出的桌面客户端。",
    pwaLabel: "网页应用（PWA）",
    pwaTitle: "安装到设备",
    pwaAvailable: "立即可用",
    pwaDesc: "支持 Windows、Mac、iOS、Android，无需应用商店——直接从浏览器安装。",
    installBtn: "安装 DockDocs",
    installedMsg: "DockDocs 已安装在此设备上。",
    chromiumHeading: "Chrome / Edge",
    chromiumStep1: "在 Chrome 或 Edge 中打开 dockdocs.app",
    chromiumStep2: "点击地址栏中的安装图标（⊕）",
    chromiumStep3: "点击「安装」——DockDocs 将在独立窗口中打开",
    safariHeading: "Safari（iOS / macOS）",
    safariStep1: "在 Safari 中打开 dockdocs.app",
    safariStep2: "点击底部分享按钮（⎙）→「添加到主屏幕」（iOS）或「添加到程序坞」（macOS Sonoma+）",
    safariStep3: "点击「添加」——DockDocs 以应用图标出现",
    otherHeading: "其他浏览器",
    otherNote: "Firefox 等浏览器不支持一键安装。请在 Chrome、Edge 或 Safari 中打开此页面。",
    desktopTitle: "桌面客户端",
    desktopComingSoon: "即将推出",
    windowsExt: ".exe 安装包",
    macExt: ".dmg 安装包",
    desktopNote: "网页应用已覆盖全部功能并支持离线使用。桌面客户端进一步提升：与操作系统深度集成，文件处理完全不经过浏览器引擎。",
    privacyHeading: "隐私",
    privacyNote: "DockDocs 大多数工具在浏览器中本地处理文件，不上传到服务器。少数转换工具使用安全的云服务，文件不做留存。桌面客户端更进一步：文件完全不经过浏览器引擎。",
    privacyLink: "隐私政策 →",
  },
  es: {
    title: "Descargar DockDocs",
    subtitle: "Instala DockDocs en tu dispositivo con un clic — o espera la aplicación de escritorio que llega pronto.",
    pwaLabel: "Aplicación web (PWA)",
    pwaTitle: "Instalar en tu dispositivo",
    pwaAvailable: "Disponible ahora",
    pwaDesc: "Funciona en Windows, Mac, iOS y Android. Sin tienda de apps — instala directamente desde tu navegador.",
    installBtn: "Instalar DockDocs",
    installedMsg: "DockDocs ya está instalado en este dispositivo.",
    chromiumHeading: "Chrome / Edge",
    chromiumStep1: "Abre dockdocs.app en Chrome o Edge",
    chromiumStep2: "Haz clic en el icono de instalación (⊕) en la barra de direcciones",
    chromiumStep3: "Haz clic en «Instalar» — DockDocs se abre en su propia ventana",
    safariHeading: "Safari (iOS / macOS)",
    safariStep1: "Abre dockdocs.app en Safari",
    safariStep2: "Toca Compartir (⎙) → «Añadir a pantalla de inicio» (iOS) o «Añadir al Dock» (macOS Sonoma+)",
    safariStep3: "Toca Añadir — DockDocs aparece como icono de app",
    otherHeading: "Otros navegadores",
    otherNote: "Firefox y la mayoría de navegadores no admiten instalación con un clic. Abre esta página en Chrome, Edge o Safari.",
    desktopTitle: "Aplicaciones de escritorio",
    desktopComingSoon: "Próximamente",
    windowsExt: "instalador .exe",
    macExt: "instalador .dmg",
    desktopNote: "La app web cubre toda la funcionalidad y funciona sin conexión. La app de escritorio añade integración a nivel del SO — los archivos nunca pasan por un motor de navegador.",
    privacyHeading: "Privacidad",
    privacyNote: "La mayoría de las herramientas de DockDocs procesan tus archivos localmente en el navegador — nada se sube a nuestros servidores. Algunas herramientas de conversión usan nuestro servicio en la nube seguro; los archivos no se retienen. La app de escritorio va más lejos: los archivos nunca pasan por un motor de navegador.",
    privacyLink: "Política de privacidad →",
  },
  pt: {
    title: "Baixar DockDocs",
    subtitle: "Instale o DockDocs no seu dispositivo com um clique — ou aguarde o app desktop que chega em breve.",
    pwaLabel: "Aplicativo web (PWA)",
    pwaTitle: "Instalar no seu dispositivo",
    pwaAvailable: "Disponível agora",
    pwaDesc: "Funciona no Windows, Mac, iOS e Android. Sem loja de apps — instale direto do navegador.",
    installBtn: "Instalar DockDocs",
    installedMsg: "DockDocs já está instalado neste dispositivo.",
    chromiumHeading: "Chrome / Edge",
    chromiumStep1: "Abra dockdocs.app no Chrome ou Edge",
    chromiumStep2: "Clique no ícone de instalação (⊕) na barra de endereços",
    chromiumStep3: "Clique em «Instalar» — o DockDocs abre em sua própria janela",
    safariHeading: "Safari (iOS / macOS)",
    safariStep1: "Abra dockdocs.app no Safari",
    safariStep2: "Toque em Compartilhar (⎙) → «Adicionar à Tela de Início» (iOS) ou «Adicionar ao Dock» (macOS Sonoma+)",
    safariStep3: "Toque em Adicionar — DockDocs aparece como ícone de app",
    otherHeading: "Outros navegadores",
    otherNote: "Firefox e a maioria dos navegadores não suportam instalação com um clique. Abra esta página no Chrome, Edge ou Safari.",
    desktopTitle: "Aplicativos desktop",
    desktopComingSoon: "Em breve",
    windowsExt: "instalador .exe",
    macExt: "instalador .dmg",
    desktopNote: "O app web já cobre toda a funcionalidade e funciona offline. O app desktop adiciona integração ao nível do SO — seus arquivos nunca passam por um motor de navegador.",
    privacyHeading: "Privacidade",
    privacyNote: "A maioria das ferramentas do DockDocs processa seus arquivos localmente no navegador — nada é enviado a nossos servidores. Algumas ferramentas de conversão usam nosso serviço em nuvem seguro; os arquivos não são retidos. O app desktop vai mais longe: seus arquivos nunca passam por um motor de navegador.",
    privacyLink: "Política de privacidade →",
  },
  fr: {
    title: "Télécharger DockDocs",
    subtitle: "Installez DockDocs sur votre appareil en un clic — ou attendez l'application bureau qui arrive bientôt.",
    pwaLabel: "Application web (PWA)",
    pwaTitle: "Installer sur votre appareil",
    pwaAvailable: "Disponible maintenant",
    pwaDesc: "Fonctionne sur Windows, Mac, iOS et Android. Sans boutique d'apps — installez directement depuis votre navigateur.",
    installBtn: "Installer DockDocs",
    installedMsg: "DockDocs est déjà installé sur cet appareil.",
    chromiumHeading: "Chrome / Edge",
    chromiumStep1: "Ouvrez dockdocs.app dans Chrome ou Edge",
    chromiumStep2: "Cliquez sur l'icône d'installation (⊕) dans la barre d'adresse",
    chromiumStep3: "Cliquez sur «Installer» — DockDocs s'ouvre dans sa propre fenêtre",
    safariHeading: "Safari (iOS / macOS)",
    safariStep1: "Ouvrez dockdocs.app dans Safari",
    safariStep2: "Appuyez sur Partager (⎙) → «Ajouter à l'écran d'accueil» (iOS) ou «Ajouter au Dock» (macOS Sonoma+)",
    safariStep3: "Appuyez sur Ajouter — DockDocs apparaît comme icône d'app",
    otherHeading: "Autres navigateurs",
    otherNote: "Firefox et la plupart des navigateurs ne prennent pas en charge l'installation en un clic. Ouvrez cette page dans Chrome, Edge ou Safari.",
    desktopTitle: "Applications bureau",
    desktopComingSoon: "Bientôt disponible",
    windowsExt: "installeur .exe",
    macExt: "installeur .dmg",
    desktopNote: "L'app web couvre toutes les fonctionnalités et fonctionne hors ligne. L'app bureau ajoute une intégration OS — vos fichiers ne passent jamais par un moteur de navigateur.",
    privacyHeading: "Confidentialité",
    privacyNote: "La plupart des outils DockDocs traitent vos fichiers localement dans votre navigateur — rien n'est envoyé à nos serveurs. Quelques outils de conversion utilisent notre service cloud sécurisé ; les fichiers ne sont pas conservés. L'app bureau va plus loin : vos fichiers ne passent jamais par un moteur de navigateur.",
    privacyLink: "Politique de confidentialité →",
  },
  ja: {
    title: "DockDocs をダウンロード",
    subtitle: "ワンクリックでデバイスにインストール — もしくは近日公開のデスクトップアプリをお待ちください。",
    pwaLabel: "ウェブアプリ（PWA）",
    pwaTitle: "デバイスにインストール",
    pwaAvailable: "今すぐ利用可能",
    pwaDesc: "Windows・Mac・iOS・Android に対応。アプリストア不要 — ブラウザから直接インストールできます。",
    installBtn: "DockDocs をインストール",
    installedMsg: "DockDocs はこのデバイスに既にインストールされています。",
    chromiumHeading: "Chrome / Edge",
    chromiumStep1: "Chrome または Edge で dockdocs.app を開く",
    chromiumStep2: "アドレスバーのインストールアイコン（⊕）をクリック",
    chromiumStep3: "「インストール」をクリック — DockDocs が独立ウィンドウで起動",
    safariHeading: "Safari（iOS / macOS）",
    safariStep1: "Safari で dockdocs.app を開く",
    safariStep2: "共有（⎙）→「ホーム画面に追加」（iOS）または「Dock に追加」（macOS Sonoma+）",
    safariStep3: "「追加」をタップ — DockDocs がアプリアイコンとして表示",
    otherHeading: "その他のブラウザ",
    otherNote: "Firefox などはワンクリックインストールに対応していません。Chrome・Edge・Safari でこのページを開いてください。",
    desktopTitle: "デスクトップアプリ",
    desktopComingSoon: "近日公開",
    windowsExt: ".exe インストーラー",
    macExt: ".dmg インストーラー",
    desktopNote: "ウェブアプリはすべての機能をカバーし、オフラインでも動作します。デスクトップアプリは OS レベルのファイル統合を追加 — ファイルはブラウザエンジンを一切介しません。",
    privacyHeading: "プライバシー",
    privacyNote: "DockDocs のほとんどのツールはファイルをブラウザ内でローカル処理 — サーバーへのアップロードはありません。一部の変換ツールは安全なクラウドサービスを使用しますがファイルは保持されません。デスクトップアプリはさらに徹底：ファイルはブラウザエンジンに一切触れません。",
    privacyLink: "プライバシーポリシー →",
  },
  de: {
    title: "DockDocs herunterladen",
    subtitle: "Installieren Sie DockDocs mit einem Klick auf Ihrem Gerät — oder warten Sie auf die Desktop-App, die bald erscheint.",
    pwaLabel: "Web-App (PWA)",
    pwaTitle: "Auf Ihrem Gerät installieren",
    pwaAvailable: "Jetzt verfügbar",
    pwaDesc: "Funktioniert auf Windows, Mac, iOS und Android. Kein App-Store nötig — direkt aus dem Browser installieren.",
    installBtn: "DockDocs installieren",
    installedMsg: "DockDocs ist auf diesem Gerät bereits installiert.",
    chromiumHeading: "Chrome / Edge",
    chromiumStep1: "Öffnen Sie dockdocs.app in Chrome oder Edge",
    chromiumStep2: "Klicken Sie auf das Installationssymbol (⊕) in der Adressleiste",
    chromiumStep3: "Klicken Sie auf «Installieren» — DockDocs öffnet sich in einem eigenen Fenster",
    safariHeading: "Safari (iOS / macOS)",
    safariStep1: "Öffnen Sie dockdocs.app in Safari",
    safariStep2: "Tippen Sie auf Teilen (⎙) → «Zum Home-Bildschirm» (iOS) oder «Zum Dock hinzufügen» (macOS Sonoma+)",
    safariStep3: "Tippen Sie auf Hinzufügen — DockDocs erscheint als App-Symbol",
    otherHeading: "Andere Browser",
    otherNote: "Firefox und die meisten anderen Browser unterstützen die Ein-Klick-Installation nicht. Öffnen Sie diese Seite in Chrome, Edge oder Safari.",
    desktopTitle: "Desktop-Apps",
    desktopComingSoon: "Demnächst",
    windowsExt: ".exe Installer",
    macExt: ".dmg Installer",
    desktopNote: "Die Web-App deckt alle Funktionen ab und funktioniert offline. Die Desktop-App fügt OS-Integration hinzu — Ihre Dateien berühren keinen Browser-Engine.",
    privacyHeading: "Datenschutz",
    privacyNote: "Die meisten DockDocs-Tools verarbeiten Ihre Dateien lokal im Browser — nichts wird auf unsere Server hochgeladen. Einige Konvertierungstools nutzen unseren sicheren Cloud-Service; Dateien werden nicht gespeichert. Die Desktop-App geht weiter: Ihre Dateien berühren keinen Browser-Engine.",
    privacyLink: "Datenschutzrichtlinie →",
  },
  ko: {
    title: "DockDocs 다운로드",
    subtitle: "원클릭으로 기기에 DockDocs를 설치하세요 — 또는 곧 출시될 데스크톱 앱을 기다리세요.",
    pwaLabel: "웹 앱 (PWA)",
    pwaTitle: "기기에 설치",
    pwaAvailable: "지금 이용 가능",
    pwaDesc: "Windows, Mac, iOS, Android에서 작동합니다. 앱 스토어 불필요 — 브라우저에서 바로 설치하세요.",
    installBtn: "DockDocs 설치",
    installedMsg: "DockDocs가 이미 이 기기에 설치되어 있습니다.",
    chromiumHeading: "Chrome / Edge",
    chromiumStep1: "Chrome 또는 Edge에서 dockdocs.app 열기",
    chromiumStep2: "주소 표시줄의 설치 아이콘 (⊕) 클릭",
    chromiumStep3: "「설치」 클릭 — DockDocs가 독립 창으로 열립니다",
    safariHeading: "Safari (iOS / macOS)",
    safariStep1: "Safari에서 dockdocs.app 열기",
    safariStep2: "공유(⎙) → 「홈 화면에 추가」(iOS) 또는 「독에 추가」(macOS Sonoma+) 탭",
    safariStep3: "「추가」 탭 — DockDocs가 앱 아이콘으로 나타납니다",
    otherHeading: "기타 브라우저",
    otherNote: "Firefox 등 대부분의 브라우저는 원클릭 설치를 지원하지 않습니다. Chrome, Edge 또는 Safari에서 이 페이지를 여세요.",
    desktopTitle: "데스크톱 앱",
    desktopComingSoon: "출시 예정",
    windowsExt: ".exe 설치 파일",
    macExt: ".dmg 설치 파일",
    desktopNote: "웹 앱은 모든 기능을 제공하며 오프라인에서도 작동합니다. 데스크톱 앱은 OS 수준의 파일 통합을 추가하며 파일이 브라우저 엔진을 거치지 않습니다.",
    privacyHeading: "개인정보 보호",
    privacyNote: "DockDocs의 대부분 도구는 브라우저에서 파일을 로컬로 처리합니다 — 서버에 업로드되지 않습니다. 일부 변환 도구는 안전한 클라우드 서비스를 사용하며 파일은 보관되지 않습니다. 데스크톱 앱은 한층 더 나아가 파일이 브라우저 엔진에 전혀 닿지 않습니다.",
    privacyLink: "개인정보 처리방침 →",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-3 space-y-2.5">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3 text-[13px] leading-snug text-[color:var(--muted)]">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[10px] font-semibold text-[color:var(--faint)]">
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function DownloadPage({ locale: localeProp }: { locale?: Locale } = {}) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [browser, setBrowser] = useState<Browser>("other");
  const [locale, setLocale] = useState<Locale>(localeProp ?? "en");
  const [openSection, setOpenSection] = useState<"chromium" | "safari" | "other" | null>(null);

  useEffect(() => {
    // Detect locale from stored preference only when not passed as a prop (standalone English route).
    if (!localeProp) {
      try {
        const stored = localStorage.getItem("dockdocs-lang");
        if (stored && AUTHORED_LOCALES.includes(stored as Locale)) {
          setLocale(stored as Locale);
        }
      } catch { /* localStorage unavailable */ }
    }

    // Detect browser for default-open step section.
    const ua = navigator.userAgent;
    const isChromium = /Chrome|Edg/.test(ua) && !/OPR|Opera/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome|Chromium/.test(ua);
    const detected: Browser = isChromium ? "chromium" : isSafari ? "safari" : "other";
    setBrowser(detected);
    setOpenSection(detected);

    // PWA install prompt (Chrome / Edge).
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Already installed as PWA.
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setInstallPrompt(null);
    }
  }

  // Resolve locale → copy strings.
  const al: AuthoredLocale = locale === "zh-Hant" ? "zh" : locale;
  const t = locale === "zh-Hant" ? deepHant(COPY.zh) : COPY[al];

  const chromiumSteps = [t.chromiumStep1, t.chromiumStep2, t.chromiumStep3];
  const safariSteps = [t.safariStep1, t.safariStep2, t.safariStep3];

  const desktopPlatforms = [
    {
      name: "Windows",
      ext: t.windowsExt,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
          <path d="M3 5.557 10.125 4.5v7.125H3zm0 12.886L10.125 19.5V12.375H3zm7.875 1.182L21 21v-8.625H10.875zM10.875 3 21 4.557V12H10.875z" />
        </svg>
      ),
    },
    {
      name: "macOS",
      ext: t.macExt,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.15 1.27-2.13 3.79.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.79M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ),
    },
  ];

  const sectionHeadingCls =
    "flex w-full items-center justify-between rounded-[var(--radius-sm)] px-4 py-3 text-left text-[13px] font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-subtle)]";

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-16">

      {/* ── Hero ── */}
      <div className="mb-10">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--accent)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M7 11l5 5 5-5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
          </svg>
        </span>
        <h1 className="mt-4 text-[30px] font-normal leading-[1.15] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[38px]">
          {t.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--muted)]">
          {t.subtitle}
        </p>
      </div>

      {/* ── Product demo ── */}
      <div className="mb-12">
        <ProductDemoHero locale={locale} />
      </div>

      {/* ── PWA card ── */}
      <section className="mb-6 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)]">

        {/* Card header */}
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">{t.pwaLabel}</p>
            <h2 className="mt-0.5 text-[17px] font-semibold text-[color:var(--foreground)]">{t.pwaTitle}</h2>
          </div>
          <span className="rounded-full bg-[color:var(--accent)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
            {t.pwaAvailable}
          </span>
        </div>

        <div className="px-6 py-5">
          <p className="text-[13px] leading-relaxed text-[color:var(--muted)]">{t.pwaDesc}</p>

          {/* Install CTA */}
          <div className="mt-5">
            {installed ? (
              <div className="flex items-center gap-2.5 rounded-[var(--radius)] border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 px-4 py-3 text-[13px] text-[color:var(--accent)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.installedMsg}
              </div>
            ) : installPrompt ? (
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 py-2.5 text-[14px] font-semibold text-[color:var(--on-accent)] transition hover:opacity-90"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M7 11l5 5 5-5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
                </svg>
                {t.installBtn}
              </button>
            ) : null}
          </div>

          {/* Browser step accordions */}
          <div className="mt-6 space-y-1 rounded-[var(--radius)] border border-[color:var(--line)] overflow-hidden">

            {/* Chrome / Edge */}
            <div>
              <button
                type="button"
                className={sectionHeadingCls}
                onClick={() => setOpenSection(openSection === "chromium" ? null : "chromium")}
              >
                <span className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-[color:var(--muted)]">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="none" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13H9v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="none" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2a10 10 0 0 0-8.66 5h17.32A10 10 0 0 0 12 2zm-4 10a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" />
                  </svg>
                  {t.chromiumHeading}
                  {browser === "chromium" && (
                    <span className="rounded bg-[color:var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
                      {locale === "zh" || locale === "zh-Hant" ? "当前浏览器" : locale === "ja" ? "このブラウザ" : locale === "de" ? "Dieser Browser" : locale === "ko" ? "현재 브라우저" : locale === "es" ? "Tu navegador" : locale === "pt" ? "Seu navegador" : locale === "fr" ? "Ce navigateur" : "Your browser"}
                    </span>
                  )}
                </span>
                <Chevron open={openSection === "chromium"} />
              </button>
              {openSection === "chromium" && (
                <div className="border-t border-[color:var(--line)] px-4 pb-4">
                  <StepList steps={chromiumSteps} />
                </div>
              )}
            </div>

            {/* Safari */}
            <div className="border-t border-[color:var(--line)]">
              <button
                type="button"
                className={sectionHeadingCls}
                onClick={() => setOpenSection(openSection === "safari" ? null : "safari")}
              >
                <span className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[color:var(--muted)]">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
                  </svg>
                  {t.safariHeading}
                  {browser === "safari" && (
                    <span className="rounded bg-[color:var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
                      {locale === "zh" || locale === "zh-Hant" ? "当前浏览器" : locale === "ja" ? "このブラウザ" : locale === "de" ? "Dieser Browser" : locale === "ko" ? "현재 브라우저" : locale === "es" ? "Tu navegador" : locale === "pt" ? "Seu navegador" : locale === "fr" ? "Ce navigateur" : "Your browser"}
                    </span>
                  )}
                </span>
                <Chevron open={openSection === "safari"} />
              </button>
              {openSection === "safari" && (
                <div className="border-t border-[color:var(--line)] px-4 pb-4">
                  <StepList steps={safariSteps} />
                </div>
              )}
            </div>

            {/* Other browsers */}
            <div className="border-t border-[color:var(--line)]">
              <button
                type="button"
                className={sectionHeadingCls}
                onClick={() => setOpenSection(openSection === "other" ? null : "other")}
              >
                <span className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[color:var(--muted)]">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {t.otherHeading}
                </span>
                <Chevron open={openSection === "other"} />
              </button>
              {openSection === "other" && (
                <div className="border-t border-[color:var(--line)] px-4 pb-4 pt-3">
                  <p className="text-[13px] leading-relaxed text-[color:var(--muted)]">{t.otherNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Desktop coming-soon cards ── */}
      <section className="mb-6">
        <h2 className="mb-3 text-[15px] font-semibold text-[color:var(--foreground)]">{t.desktopTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {desktopPlatforms.map(({ name, icon, ext }) => (
            <div
              key={name}
              className="flex items-center gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 py-4"
            >
              <span className="shrink-0 text-[color:var(--faint)]">{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{name}</p>
                <p className="text-[11px] text-[color:var(--faint)]">{ext}</p>
              </div>
              <span className="shrink-0 rounded border border-[color:var(--line)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--faint)]">
                {t.desktopComingSoon}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-[color:var(--faint)]">{t.desktopNote}</p>
      </section>

      {/* ── Privacy bar ── */}
      <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 py-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px shrink-0 text-[color:var(--accent)]">
          <path d="M8 1.5L2 4v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
        <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
          <span className="font-semibold text-[color:var(--foreground)]">{t.privacyHeading}: </span>
          {t.privacyNote}{" "}
          <a href="/privacy-policy" className="text-[color:var(--accent)] hover:underline">{t.privacyLink}</a>
        </p>
      </div>

    </div>
  );
}

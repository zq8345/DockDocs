"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { CircularProgress } from "../../../shared/templates/pdf-tool-page/workflow-engine-components";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { runPdfRuntime, createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
type Item = { id: string; name: string; file: File; status: "queued" | "done" | "error"; blob?: Blob; msg?: string };

const MAX_FILES = 30;
const PW_OK = /^[A-Za-z0-9_]{4,32}$/;

const _en = {
    title: "Batch encrypt",
    subtitle: "Set one password and lock a whole folder of PDFs — each is encrypted in your browser and packaged into a single ZIP. Nothing is uploaded.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    pw: "Password", pwPlaceholder: "Password to open the files", show: "Show", hide: "Hide",
    pwRule: "4–32 characters: letters, digits, underscore (_).",
    run: "Encrypt all", running: "Encrypting", download: "Download ZIP", reset: "Start over", remove: "Remove",
    files: (n: number, max: number) => `${n} / ${max} files`, done: "encrypted", failed: "failed",
    needFile: "Add at least one PDF.", needPw: "Enter a valid password (4–32: letters, digits, underscore).",
    note: "Each PDF will require this password to open. Already-encrypted PDFs are skipped. Everything stays on your device.",
    err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "批量 PDF 加密",
    subtitle: "设一个密码，给整个文件夹的 PDF 加密——每个都在浏览器中加密并打包成一个 ZIP。不上传任何文件。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    pw: "密码", pwPlaceholder: "打开文件所需的密码", show: "显示", hide: "隐藏",
    pwRule: "4–32 位：字母、数字、下划线(_)。",
    run: "全部加密", running: "加密中", download: "下载 ZIP", reset: "重新开始", remove: "移除",
    files: (n: number, max: number) => `${n} / ${max} 份`, done: "已加密", failed: "失败",
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
    run: "Cifrar todo", running: "Cifrando", download: "Descargar ZIP", reset: "Empezar de nuevo", remove: "Quitar",
    files: (n: number, max: number) => `${n} / ${max} archivos`, done: "cifrado", failed: "error",
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
    run: "Criptografar tudo", running: "Criptografando", download: "Baixar ZIP", reset: "Recomeçar", remove: "Remover",
    files: (n: number, max: number) => `${n} / ${max} arquivos`, done: "criptografado", failed: "erro",
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
    run: "Tout chiffrer", running: "Chiffrement en cours", download: "Télécharger le ZIP", reset: "Recommencer", remove: "Retirer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`, done: "chiffré", failed: "échec",
    needFile: "Ajoutez au moins un PDF.", needPw: "Saisissez un mot de passe valide (4 à 32 : lettres, chiffres et trait de soulignement).",
    note: "Chaque PDF nécessitera ce mot de passe pour être ouvert. Les PDF déjà chiffrés sont ignorés. Tout reste sur votre appareil.",
    err: "Une erreur est survenue : ",
  },
  ja: {
    title: "一括暗号化",
    subtitle: "パスワードを1つ設定して、フォルダ内のPDFをまとめてロック——各ファイルはブラウザ内で暗号化され、1つのZIPにまとめられます。アップロードは一切ありません。",
    drop: "PDF（またはフォルダ）をここにドラッグ＆ドロップ、またはクリックして選択", choose: "PDFを選択", folder: "フォルダを選択",
    pw: "パスワード", pwPlaceholder: "ファイルを開くためのパスワード", show: "表示", hide: "非表示",
    pwRule: "4～32文字：英字、数字、アンダースコア（_）。",
    run: "すべて暗号化", running: "暗号化中", download: "ZIPをダウンロード", reset: "最初からやり直す", remove: "削除",
    files: (n: number, max: number) => `${n} / ${max}件`, done: "暗号化済み", failed: "失敗",
    needFile: "PDFを少なくとも1つ追加してください。", needPw: "有効なパスワードを入力してください（4～32：英字、数字、アンダースコア）。",
    note: "各PDFを開くにはこのパスワードが必要になります。すでに暗号化されたPDFはスキップされます。すべてデバイス内で完結します。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "Stapelweise verschlüsseln",
    subtitle: "Legen Sie ein Passwort fest und sperren Sie einen ganzen Ordner mit PDFs – jede Datei wird in Ihrem Browser verschlüsselt und in einem einzigen ZIP gebündelt. Die meisten Tools laufen direkt in Ihrem Browser.",
    drop: "PDFs (oder einen Ordner) hierher ziehen und ablegen oder zum Auswählen klicken", choose: "PDFs auswählen", folder: "Ordner auswählen",
    pw: "Passwort", pwPlaceholder: "Passwort zum Öffnen der Dateien", show: "Anzeigen", hide: "Verbergen",
    pwRule: "4–32 Zeichen: Buchstaben, Ziffern, Unterstrich (_).",
    run: "Alle verschlüsseln", running: "Wird verschlüsselt", download: "ZIP herunterladen", reset: "Neu beginnen", remove: "Entfernen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`, done: "verschlüsselt", failed: "fehlgeschlagen",
    needFile: "Fügen Sie mindestens ein PDF hinzu.", needPw: "Geben Sie ein gültiges Passwort ein (4–32: Buchstaben, Ziffern, Unterstrich).",
    note: "Jedes PDF benötigt dieses Passwort zum Öffnen. Bereits verschlüsselte PDFs werden übersprungen. Die Verarbeitung erfolgt auf Ihrem Gerät.",
    err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    title: "일괄 암호화",
    subtitle: "비밀번호 하나를 설정해 PDF 폴더 전체를 잠그세요 — 각 파일은 브라우저에서 암호화되어 하나의 ZIP으로 묶입니다. 아무것도 업로드되지 않습니다.",
    drop: "PDF(또는 폴더)를 여기로 끌어다 놓거나 클릭해 선택하세요", choose: "PDF 선택", folder: "폴더 선택",
    pw: "비밀번호", pwPlaceholder: "파일을 열 비밀번호", show: "표시", hide: "숨기기",
    pwRule: "4~32자: 영문, 숫자, 밑줄(_).",
    run: "전체 암호화", running: "암호화 중", download: "ZIP 다운로드", reset: "다시 시작", remove: "제거",
    files: (n: number, max: number) => `${n} / ${max}개`, done: "암호화됨", failed: "실패",
    needFile: "PDF를 최소 한 개 추가하세요.", needPw: "유효한 비밀번호를 입력하세요(4~32자: 영문, 숫자, 밑줄).",
    note: "각 PDF를 열려면 이 비밀번호가 필요합니다. 이미 암호화된 PDF는 건너뜁니다. 모든 작업은 기기에서 처리됩니다.",
    err: "문제가 발생했습니다: ",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why batch-encrypt PDFs in your browser",
    benefitsDescription: "Lock an entire folder of PDFs with one password and get them all back as a single ZIP.",
    benefits: [
      { title: "One password, a whole folder", description: "Set a single password once and apply real AES-256 encryption to every PDF in the batch — no opening and re-saving files one at a time." },
      { title: "Packaged into one ZIP", description: "Every encrypted PDF comes back named after the original in one tidy ZIP, ready to forward or archive in a single download." },
      { title: "Built for stacks of files", description: "Process up to 30 PDFs in a run, with already-encrypted files skipped automatically so nothing is double-locked." },
    ],
    workflowTitle: "How batch encryption fits your document work",
    workflowDescription: "For the moment you need to send a folder of contracts, statements, or records and every file has to be password-protected before it leaves your hands.",
    steps: [
      "Drop in your PDFs or pick a whole folder at once.",
      "Type one password and encrypt every file in the batch.",
      "Download the single ZIP of protected PDFs.",
    ],
    readingTitle: "More ways to protect PDFs",
    readingDescription: "Related tools and guides for locking and unlocking documents.",
    readingLinks: [
      { label: "Protect a single PDF", href: "/protect-pdf", description: "Password-protect just one PDF when you don't need the whole batch." },
      { label: "How to remove a PDF password", href: "/guides/remove-password-from-pdf", description: "The reverse — take the password off a PDF you already own." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里批量加密 PDF",
    benefitsDescription: "用一个密码锁住整个文件夹的 PDF，全部打包成一个 ZIP 取回。",
    benefits: [
      { title: "一个密码，整个文件夹", description: "只需设一次密码，就对批次里的每个 PDF 应用真正的 AES-256 加密——不必逐个打开再另存。" },
      { title: "打包成一个 ZIP", description: "每个加密后的 PDF 都沿用原文件名，整齐收进一个 ZIP，一次下载即可转发或归档。" },
      { title: "为成堆文件而生", description: "单次最多处理 30 个 PDF，已加密的文件会自动跳过，绝不重复加锁。" },
    ],
    workflowTitle: "批量加密如何融入你的文档工作",
    workflowDescription: "当你要发送一整个文件夹的合同、对账单或档案，而每个文件离手前都必须加上密码保护时。",
    steps: [
      "拖入你的 PDF，或一次性选择整个文件夹。",
      "输入一个密码，给批次里的每个文件加密。",
      "下载这一个装着受保护 PDF 的 ZIP。",
    ],
    readingTitle: "更多保护 PDF 的方式",
    readingDescription: "锁定与解锁文档的相关工具和指南。",
    readingLinks: [
      { label: "保护单个 PDF", href: "/protect-pdf", description: "当你不需要整批处理时，只给一个 PDF 设密码。" },
      { label: "如何移除 PDF 密码", href: "/guides/remove-password-from-pdf", description: "反向操作——为你已拥有的 PDF 去掉密码。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué cifrar PDF por lotes en tu navegador",
    benefitsDescription: "Bloquea una carpeta entera de PDF con una sola contraseña y recupéralos todos en un único ZIP.",
    benefits: [
      { title: "Una contraseña, toda una carpeta", description: "Define una contraseña una sola vez y aplica cifrado AES-256 real a cada PDF del lote, sin abrir y volver a guardar archivos uno por uno." },
      { title: "Empaquetados en un solo ZIP", description: "Cada PDF cifrado vuelve con el nombre del original en un ZIP ordenado, listo para reenviar o archivar en una sola descarga." },
      { title: "Pensado para pilas de archivos", description: "Procesa hasta 30 PDF por ejecución y los archivos ya cifrados se omiten automáticamente para no bloquearlos dos veces." },
    ],
    workflowTitle: "Cómo encaja el cifrado por lotes en tu trabajo",
    workflowDescription: "Para cuando necesitas enviar una carpeta de contratos, estados de cuenta o expedientes y cada archivo debe protegerse con contraseña antes de salir de tus manos.",
    steps: [
      "Suelta tus PDF o elige una carpeta entera de una vez.",
      "Escribe una contraseña y cifra cada archivo del lote.",
      "Descarga el único ZIP de PDF protegidos.",
    ],
    readingTitle: "Más formas de proteger PDF",
    readingDescription: "Herramientas y guías relacionadas para bloquear y desbloquear documentos.",
    readingLinks: [
      { label: "Proteger un solo PDF", href: "/protect-pdf", description: "Protege con contraseña un único PDF cuando no necesitas todo el lote." },
      { label: "Cómo quitar la contraseña de un PDF", href: "/guides/remove-password-from-pdf", description: "Lo contrario: quita la contraseña de un PDF que ya posees." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que criptografar PDF em lote no seu navegador",
    benefitsDescription: "Bloqueie uma pasta inteira de PDFs com uma só senha e receba todos de volta em um único ZIP.",
    benefits: [
      { title: "Uma senha, uma pasta inteira", description: "Defina uma senha uma única vez e aplique criptografia AES-256 real a cada PDF do lote, sem abrir e salvar de novo arquivo por arquivo." },
      { title: "Empacotados em um único ZIP", description: "Cada PDF criptografado volta com o nome do original em um ZIP organizado, pronto para encaminhar ou arquivar em um só download." },
      { title: "Feito para pilhas de arquivos", description: "Processe até 30 PDFs por execução, com os arquivos já criptografados ignorados automaticamente para não bloquear duas vezes." },
    ],
    workflowTitle: "Como a criptografia em lote se encaixa no seu trabalho",
    workflowDescription: "Para quando você precisa enviar uma pasta de contratos, extratos ou registros e cada arquivo tem de ser protegido por senha antes de sair das suas mãos.",
    steps: [
      "Solte seus PDFs ou escolha uma pasta inteira de uma vez.",
      "Digite uma senha e criptografe cada arquivo do lote.",
      "Baixe o único ZIP de PDFs protegidos.",
    ],
    readingTitle: "Mais formas de proteger PDF",
    readingDescription: "Ferramentas e guias relacionados para bloquear e desbloquear documentos.",
    readingLinks: [
      { label: "Proteger um único PDF", href: "/protect-pdf", description: "Proteja com senha um só PDF quando não precisar do lote inteiro." },
      { label: "Como remover a senha de um PDF", href: "/guides/remove-password-from-pdf", description: "O contrário: tire a senha de um PDF que já é seu." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi chiffrer des PDF par lot dans votre navigateur",
    benefitsDescription: "Verrouillez un dossier entier de PDF avec un seul mot de passe et récupérez-les tous dans un unique ZIP.",
    benefits: [
      { title: "Un mot de passe, tout un dossier", description: "Définissez un mot de passe une seule fois et appliquez un vrai chiffrement AES-256 à chaque PDF du lot, sans ouvrir et réenregistrer les fichiers un par un." },
      { title: "Regroupés dans un seul ZIP", description: "Chaque PDF chiffré revient au nom de l'original dans un ZIP bien rangé, prêt à transférer ou archiver en un seul téléchargement." },
      { title: "Conçu pour les piles de fichiers", description: "Traitez jusqu'à 30 PDF par exécution ; les fichiers déjà chiffrés sont ignorés automatiquement pour ne pas les verrouiller deux fois." },
    ],
    workflowTitle: "Comment le chiffrement par lot s'intègre à votre travail",
    workflowDescription: "Pour le moment où vous devez envoyer un dossier de contrats, de relevés ou de dossiers et où chaque fichier doit être protégé par mot de passe avant de quitter vos mains.",
    steps: [
      "Déposez vos PDF ou choisissez un dossier entier d'un coup.",
      "Saisissez un mot de passe et chiffrez chaque fichier du lot.",
      "Téléchargez l'unique ZIP de PDF protégés.",
    ],
    readingTitle: "Plus de façons de protéger les PDF",
    readingDescription: "Outils et guides associés pour verrouiller et déverrouiller des documents.",
    readingLinks: [
      { label: "Protéger un seul PDF", href: "/protect-pdf", description: "Protégez par mot de passe un seul PDF quand vous n'avez pas besoin de tout le lot." },
      { label: "Comment retirer le mot de passe d'un PDF", href: "/guides/remove-password-from-pdf", description: "L'inverse : retirez le mot de passe d'un PDF qui vous appartient déjà." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF を一括暗号化する理由",
    benefitsDescription: "1 つのパスワードでフォルダ内の PDF をまとめてロックし、1 つの ZIP で受け取れます。",
    benefits: [
      { title: "1 つのパスワードでフォルダ全体", description: "パスワードを一度設定するだけで、バッチ内のすべての PDF に本物の AES-256 暗号化を適用——1 ファイルずつ開いて保存し直す必要はありません。" },
      { title: "1 つの ZIP にまとめて", description: "暗号化された各 PDF は元のファイル名のまま、整った 1 つの ZIP に収まり、1 回のダウンロードで転送や保管ができます。" },
      { title: "大量のファイル向けに設計", description: "1 回で最大 30 件の PDF を処理し、すでに暗号化されたファイルは自動的にスキップされるため二重ロックになりません。" },
    ],
    workflowTitle: "一括暗号化が文書作業にどう役立つか",
    workflowDescription: "契約書、明細書、記録のフォルダを送る必要があり、手元を離れる前にどのファイルもパスワード保護しなければならないとき。",
    steps: [
      "PDF をドロップするか、フォルダごと一度に選択します。",
      "パスワードを 1 つ入力し、バッチ内のすべてのファイルを暗号化します。",
      "保護された PDF が入った 1 つの ZIP をダウンロードします。",
    ],
    readingTitle: "PDF を保護する他の方法",
    readingDescription: "文書のロックと解除に関する関連ツールとガイド。",
    readingLinks: [
      { label: "単一の PDF を保護", href: "/protect-pdf", description: "バッチ全体が不要なときに、1 つの PDF だけにパスワードを設定します。" },
      { label: "PDF のパスワードを解除する方法", href: "/guides/remove-password-from-pdf", description: "逆の操作——すでに自分が所有する PDF からパスワードを外します。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDFs stapelweise im Browser verschlüsseln",
    benefitsDescription: "Sperren Sie einen ganzen Ordner mit PDFs mit einem Passwort und erhalten Sie alle zusammen als einzelnes ZIP zurück.",
    benefits: [
      { title: "Ein Passwort, ein ganzer Ordner", description: "Legen Sie das Passwort einmal fest und wenden Sie echte AES-256-Verschlüsselung auf jedes PDF im Stapel an – ohne die Dateien einzeln zu öffnen und neu zu speichern." },
      { title: "In einem ZIP gebündelt", description: "Jedes verschlüsselte PDF kommt unter dem Namen des Originals in einem aufgeräumten ZIP zurück, bereit zum Weiterleiten oder Archivieren in einem einzigen Download." },
      { title: "Für Stapel von Dateien gemacht", description: "Verarbeiten Sie bis zu 30 PDFs pro Durchlauf; bereits verschlüsselte Dateien werden automatisch übersprungen, damit nichts doppelt gesperrt wird." },
    ],
    workflowTitle: "Wie die Stapelverschlüsselung in Ihre Dokumentenarbeit passt",
    workflowDescription: "Für den Moment, in dem Sie einen Ordner mit Verträgen, Kontoauszügen oder Unterlagen versenden müssen und jede Datei passwortgeschützt sein muss, bevor sie Ihre Hände verlässt.",
    steps: [
      "Legen Sie Ihre PDFs ab oder wählen Sie einen ganzen Ordner auf einmal aus.",
      "Geben Sie ein Passwort ein und verschlüsseln Sie jede Datei im Stapel.",
      "Laden Sie das einzelne ZIP mit den geschützten PDFs herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zu schützen",
    readingDescription: "Verwandte Tools und Anleitungen zum Sperren und Entsperren von Dokumenten.",
    readingLinks: [
      { label: "Ein einzelnes PDF schützen", href: "/protect-pdf", description: "Schützen Sie nur ein einzelnes PDF mit einem Passwort, wenn Sie nicht den ganzen Stapel benötigen." },
      { label: "So entfernen Sie ein PDF-Passwort", href: "/guides/remove-password-from-pdf", description: "Der umgekehrte Weg – entfernen Sie das Passwort von einem PDF, das Ihnen bereits gehört." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "브라우저에서 PDF를 일괄 암호화하는 이유",
    benefitsDescription: "비밀번호 하나로 PDF 폴더 전체를 잠그고 모두 하나의 ZIP으로 받으세요.",
    benefits: [
      { title: "비밀번호 하나, 폴더 전체", description: "비밀번호를 한 번만 설정하면 배치의 모든 PDF에 실제 AES-256 암호화가 적용됩니다 — 파일을 하나씩 열어 다시 저장할 필요가 없습니다." },
      { title: "하나의 ZIP으로 묶음", description: "암호화된 각 PDF는 원본 이름 그대로 정돈된 ZIP 하나에 담겨, 한 번의 다운로드로 전달하거나 보관할 수 있습니다." },
      { title: "대량 파일을 위해 설계", description: "한 번에 최대 30개의 PDF를 처리하며, 이미 암호화된 파일은 자동으로 건너뛰어 이중으로 잠기지 않습니다." },
    ],
    workflowTitle: "일괄 암호화가 문서 작업에 어떻게 맞물리나요",
    workflowDescription: "계약서, 명세서, 기록 폴더를 보내야 하는데 손을 떠나기 전에 모든 파일을 비밀번호로 보호해야 하는 순간을 위한 기능입니다.",
    steps: [
      "PDF를 끌어다 놓거나 폴더 전체를 한 번에 선택하세요.",
      "비밀번호 하나를 입력해 배치의 모든 파일을 암호화하세요.",
      "보호된 PDF가 담긴 ZIP 하나를 다운로드하세요.",
    ],
    readingTitle: "PDF를 보호하는 더 많은 방법",
    readingDescription: "문서를 잠그고 푸는 데 도움이 되는 관련 도구와 가이드입니다.",
    readingLinks: [
      { label: "단일 PDF 보호", href: "/protect-pdf", description: "배치 전체가 필요 없을 때 PDF 하나에만 비밀번호를 설정합니다." },
      { label: "PDF 비밀번호 제거 방법", href: "/guides/remove-password-from-pdf", description: "반대 작업 — 이미 보유한 PDF에서 비밀번호를 제거합니다." },
      { label: "PDF 워크플로 자료", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 허브입니다." },
    ],
  },
};

export function BatchProtectClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is fully authored (Korean strings live in STR.ko/SECTIONS.ko); it indexes its own [al]
  // entry. zh-Hant is collapsed here because every [al] index below is already inside a
  // `locale === "zh-Hant" ? deepHant(…) :` ternary, so the zh-Hant case never reaches [al].
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
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
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f, status: "queued" as const }))].slice(0, maxFiles));
  }, []);

  const reset = () => { setItems([]); setPhase("idle"); setProgress(0); setError(null); };

  const run = useCallback(async () => {
    if (items.length === 0) { setError(t.needFile); return; }
    if (!PW_OK.test(password)) { setError(t.needPw); return; }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
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
          locale,
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
      trackToolRun("batch-protect-pdf");
      URL.revokeObjectURL(url);
    } catch (e) {
      const ZIP_ERR: Record<AuthoredLocale, string> = {
        en: "Could not build the download — please try again.",
        zh: "打包下载失败，请重试。",
        es: "No se pudo crear la descarga. Inténtalo de nuevo.",
        pt: "Não foi possível criar o download. Tente novamente.",
        fr: "Impossible de créer le téléchargement. Réessayez.",
        ja: "ダウンロードの作成に失敗しました。もう一度お試しください。",
        de: "Der Download konnte nicht erstellt werden – bitte versuchen Sie es erneut.",
        ko: "다운로드를 만들지 못했습니다 — 다시 시도해 주세요.",
      };
      setError(locale === "zh-Hant" ? toHant(ZIP_ERR.zh) : ZIP_ERR[al]);
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} embedded={embedded} valueZone="client" />
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
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              {items.length < maxFiles && phase !== "running" && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && doneCount > 0 ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? t.running : t.run}</button>
              )}
            </div>
          </div>

          {phase === "running" && (
            <div className="mx-auto mt-6 max-w-[200px]">
              <CircularProgress
                bare
                progress={items.length > 0 ? (progress / items.length) * 100 : 0}
                title={t.running}
                description={`${progress} / ${items.length}`}
              />
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((it) => (
              <BatchFileCard
                key={it.id}
                file={it.file}
                status={it.status}
                errorMsg={it.msg}
                doneLabel={t.done}
                failLabel={t.failed}
                removeLabel={t.remove}
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {phase === "done" && !embedded && (
        <div className="mt-6">
          <ToolBridge slug="batch-protect-pdf" locale={locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="batch-protect-pdf" locale={locale} />}
    </div>
  );
}

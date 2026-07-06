// Shared detection + friendly messaging for PDFs the parser refuses: encrypted,
// empty (0 bytes), and corrupt/not-really-a-PDF. pdf.js rejects getDocument()
// with PasswordException / InvalidPDFException ("The PDF file is empty…",
// "Invalid PDF structure.") or chokes deeper ("Invalid argument for
// stringToBytes" on a forged /Encrypt dict); pdf-lib throws EncryptedPDFError /
// parse failures. All of those are raw ENGLISH developer strings — never show
// them to a user. Every PDF entry point (tool clients AND AI clients) maps
// parse errors through pdfParseErrorMessage() below instead of hand-rolling a
// per-tool catch (单H 修根, 2026-07-05). The engine-template path has the same
// mapping inside shared/templates/pdf-tool-page/pdf-runtime.ts
// getPdfRuntimeErrorMessage (shared/ can't import apps/lib) — keep the two
// message sets in step when editing either.

import { toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

/** True if the error is pdf.js / pdf-lib refusing a password-protected PDF. */
export function isEncryptedPdfError(e: unknown): boolean {
  if (!e) return false;
  const name = (e as { name?: string }).name ?? "";
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return (
    name === "PasswordException" ||
    name === "EncryptedPDFError" ||
    msg.includes("password") ||
    msg.includes("is encrypted")
  );
}

/** True if the parser reported a 0-byte file (pdf.js InvalidPDFException wording). */
export function isEmptyPdfError(e: unknown): boolean {
  if (!e) return false;
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return msg.includes("empty") && (msg.includes("zero bytes") || msg.includes("pdf"));
}

/**
 * True if the bytes aren't a readable document: truncated, garbage-with-the-
 * right-extension, forged structure. Covers pdf.js InvalidPDFException ("Invalid
 * PDF structure"), its deeper chokes on forged dictionaries ("Invalid argument
 * for stringToBytes", "bad XRef"…), pdf-lib parse failures, AND the OOXML
 * translator's file-type-neutral "Invalid file structure." (lib/ooxml-translate
 * throws it for a corrupt .docx/.pptx/.xlsx ZIP — "PDF" would mislead there).
 */
export function isCorruptPdfError(e: unknown): boolean {
  if (!e) return false;
  const name = (e as { name?: string }).name ?? "";
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return (
    name === "InvalidPDFException" ||
    msg.includes("invalid pdf structure") ||
    msg.includes("invalid file structure") ||
    msg.includes("stringtobytes") ||
    msg.includes("bad xref") ||
    msg.includes("failed to parse pdf") ||
    msg.includes("no pdf header found")
  );
}

/** The bilingual "unlock first" notice shown for encrypted PDFs. */
export function encryptedPdfNotice(locale: Locale): string {
  if (locale === "zh-Hant") return toHant("这个 PDF 受密码保护，无法读取。请先用「解锁 PDF」工具（输入密码移除保护）处理后，再回到这里使用本工具。");
  if (locale === "zh") return "这个 PDF 受密码保护，无法读取。请先用「解锁 PDF」工具（输入密码移除保护）处理后，再回到这里使用本工具。";
  if (locale === "es") return "Este PDF está protegido con contraseña y no se puede abrir. Elimina la protección primero con la herramienta \"Desbloquear PDF\" y luego vuelve a intentarlo.";
  if (locale === "pt") return "Este PDF está protegido por senha e não pode ser aberto. Remova a proteção primeiro com a ferramenta \"Desbloquear PDF\" e tente novamente.";
  if (locale === "fr") return "Ce PDF est protégé par un mot de passe et ne peut pas être ouvert. Supprimez d'abord la protection avec l'outil « Déverrouiller PDF », puis réessayez.";
  if (locale === "ja") return "この PDF はパスワードで保護されているため、開くことができません。まず「PDF のパスワードを解除」ツールで保護を解除してから、もう一度お試しください。";
  if (locale === "de") return "Dieses PDF ist passwortgeschützt und kann nicht geöffnet werden. Entfernen Sie den Schutz zuerst mit dem Tool „PDF entsperren“ und versuchen Sie es dann erneut.";
  if (locale === "ko") return "이 PDF는 비밀번호로 보호되어 있어 열 수 없습니다. 먼저 「PDF 잠금 해제」 도구로 보호를 해제한 다음 다시 시도하세요.";
  return "This PDF is password-protected, so it can't be opened. Remove the protection first with the \"Unlock PDF\" tool, then come back and try again.";
}

/** The "this file is empty" notice for 0-byte uploads. */
export function emptyPdfNotice(locale: Locale): string {
  if (locale === "zh-Hant") return toHant("这个文件是空的（0 字节），没有内容可读取。请重新导出 PDF，或选择另一个文件。");
  if (locale === "zh") return "这个文件是空的（0 字节），没有内容可读取。请重新导出 PDF，或选择另一个文件。";
  if (locale === "es") return "Este archivo está vacío (0 bytes) y no hay nada que leer. Vuelve a exportar el PDF o elige otro archivo.";
  if (locale === "pt") return "Este arquivo está vazio (0 bytes) e não há nada para ler. Exporte o PDF novamente ou escolha outro arquivo.";
  if (locale === "fr") return "Ce fichier est vide (0 octet), il n'y a rien à lire. Exportez à nouveau le PDF ou choisissez un autre fichier.";
  if (locale === "ja") return "このファイルは空（0 バイト）のため、読み取れる内容がありません。PDF を書き出し直すか、別のファイルを選んでください。";
  if (locale === "de") return "Diese Datei ist leer (0 Byte), es gibt nichts zu lesen. Exportieren Sie das PDF erneut oder wählen Sie eine andere Datei.";
  if (locale === "ko") return "이 파일은 비어 있어(0바이트) 읽을 내용이 없습니다. PDF를 다시 내보내거나 다른 파일을 선택하세요.";
  return "This file is empty (0 bytes), so there's nothing to read. Re-export the PDF, or choose a different file.";
}

/** The "couldn't read this file" notice for corrupt / truncated / fake PDFs. */
export function corruptPdfNotice(locale: Locale): string {
  if (locale === "zh-Hant") return toHant("无法读取这个文件——它可能已损坏、下载不完整，或者并不是真正的 PDF。请重新导出或下载后再试。");
  if (locale === "zh") return "无法读取这个文件——它可能已损坏、下载不完整，或者并不是真正的 PDF。请重新导出或下载后再试。";
  if (locale === "es") return "No se pudo leer este archivo: puede estar dañado, incompleto o no ser realmente un PDF. Vuelve a exportarlo o descargarlo e inténtalo de nuevo.";
  if (locale === "pt") return "Não foi possível ler este arquivo — ele pode estar corrompido, incompleto ou não ser realmente um PDF. Exporte-o ou baixe-o novamente e tente outra vez.";
  if (locale === "fr") return "Impossible de lire ce fichier : il est peut-être endommagé, incomplet, ou ce n'est pas vraiment un PDF. Exportez-le ou téléchargez-le à nouveau, puis réessayez.";
  if (locale === "ja") return "このファイルを読み取れませんでした。破損している、ダウンロードが不完全、または実際には PDF ではない可能性があります。書き出し直すか再ダウンロードしてからお試しください。";
  if (locale === "de") return "Diese Datei konnte nicht gelesen werden – sie ist möglicherweise beschädigt, unvollständig oder gar kein PDF. Exportieren oder laden Sie sie erneut herunter und versuchen Sie es noch einmal.";
  if (locale === "ko") return "이 파일을 읽을 수 없습니다. 손상되었거나 불완전하거나 실제 PDF가 아닐 수 있습니다. 다시 내보내거나 다운로드한 후 시도하세요.";
  return "This file couldn't be read — it may be damaged, incompletely downloaded, or not actually a PDF. Re-export or re-download it and try again.";
}

/**
 * THE parse-error mapper every PDF entry point shares: returns a localized,
 * human message for the known parser failures (encrypted → empty → corrupt),
 * or null for anything else so the caller can fall back to its own copy.
 * Use as: setError(pdfParseErrorMessage(e, locale) ?? fallbackMessage).
 */
export function pdfParseErrorMessage(e: unknown, locale: Locale): string | null {
  if (isEncryptedPdfError(e)) return encryptedPdfNotice(locale);
  if (isEmptyPdfError(e)) return emptyPdfNotice(locale);
  if (isCorruptPdfError(e)) return corruptPdfNotice(locale);
  return null;
}

/**
 * Returns the friendly encrypted-PDF notice, or null when the error is something
 * else. Prefer pdfParseErrorMessage (it covers empty/corrupt too); this stays
 * for callers that intentionally only special-case encryption.
 */
export function encryptedPdfMessage(e: unknown, locale: Locale): string | null {
  return isEncryptedPdfError(e) ? encryptedPdfNotice(locale) : null;
}

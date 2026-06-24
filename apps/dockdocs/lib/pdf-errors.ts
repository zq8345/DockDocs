// Shared detection + friendly messaging for password-protected (encrypted) PDFs.
// pdf.js rejects getDocument() with a PasswordException; pdf-lib throws an
// EncryptedPDFError from PDFDocument.load(). Either way the user just needs to
// unlock the file first — so we turn the raw stack message into a clear hint
// instead of dumping "PasswordException: No password given" onto the page.

import { toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "zh-Hant";

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

/** The bilingual "unlock first" notice shown for encrypted PDFs. */
export function encryptedPdfNotice(locale: Locale): string {
  if (locale === "zh-Hant") return toHant("这个 PDF 受密码保护，无法读取。请先用「解锁 PDF」工具（输入密码移除保护）处理后，再回到这里使用本工具。");
  if (locale === "zh") return "这个 PDF 受密码保护，无法读取。请先用「解锁 PDF」工具（输入密码移除保护）处理后，再回到这里使用本工具。";
  if (locale === "es") return "Este PDF está protegido con contraseña y no se puede abrir. Elimina la protección primero con la herramienta \"Desbloquear PDF\" y luego vuelve a intentarlo.";
  if (locale === "pt") return "Este PDF está protegido por senha e não pode ser aberto. Remova a proteção primeiro com a ferramenta \"Desbloquear PDF\" e tente novamente.";
  if (locale === "fr") return "Ce PDF est protégé par un mot de passe et ne peut pas être ouvert. Supprimez d'abord la protection avec l'outil « Déverrouiller PDF », puis réessayez.";
  if (locale === "ja") return "この PDF はパスワードで保護されているため、開くことができません。まず「PDF のパスワードを解除」ツールで保護を解除してから、もう一度お試しください。";
  if (locale === "de") return "Dieses PDF ist passwortgeschützt und kann nicht geöffnet werden. Entfernen Sie den Schutz zuerst mit dem Tool „PDF entsperren“ und versuchen Sie es dann erneut.";
  return "This PDF is password-protected, so it can't be opened. Remove the protection first with the \"Unlock PDF\" tool, then come back and try again.";
}

/**
 * Returns the friendly encrypted-PDF notice, or null when the error is something
 * else. Use as: setError(encryptedPdfMessage(e, locale) ?? fallbackMessage).
 */
export function encryptedPdfMessage(e: unknown, locale: Locale): string | null {
  return isEncryptedPdfError(e) ? encryptedPdfNotice(locale) : null;
}

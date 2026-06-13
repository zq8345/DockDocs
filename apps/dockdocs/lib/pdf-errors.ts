// Shared detection + friendly messaging for password-protected (encrypted) PDFs.
// pdf.js rejects getDocument() with a PasswordException; pdf-lib throws an
// EncryptedPDFError from PDFDocument.load(). Either way the user just needs to
// unlock the file first — so we turn the raw stack message into a clear hint
// instead of dumping "PasswordException: No password given" onto the page.

type Locale = "en" | "zh" | "es";

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
  return locale === "zh"
    ? "这个 PDF 受密码保护，无法读取。请先用「解锁 PDF」工具（输入密码移除保护）处理后，再回到这里使用本工具。"
    : "This PDF is password-protected, so it can't be opened. Remove the protection first with the “Unlock PDF” tool, then come back and try again.";
}

/**
 * Returns the friendly encrypted-PDF notice, or null when the error is something
 * else. Use as: setError(encryptedPdfMessage(e, locale) ?? fallbackMessage).
 */
export function encryptedPdfMessage(e: unknown, locale: Locale): string | null {
  return isEncryptedPdfError(e) ? encryptedPdfNotice(locale) : null;
}

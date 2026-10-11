/**
 * Pure helper: extracts a Google Drive folder ID from a pasted share link (or a raw ID).
 */
const ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

export function parseDriveFolderId(input: string): string | null {
  const text = (input || '').trim();
  if (!text) return null;

  if (ID_PATTERN.test(text)) return text;

  try {
    const url = new URL(text);
    if (!/(^|\.)google\.com$/.test(url.hostname)) return null;

    const folderMatch = url.pathname.match(/\/folders\/([A-Za-z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];

    const idParam = url.searchParams.get('id');
    if (idParam && ID_PATTERN.test(idParam)) return idParam;
  } catch {
    return null;
  }
  return null;
}

export function getVaultImageUrl(filePath: string | undefined | null): string {
  if (!filePath) return '';
  const normalized = filePath.replace(/\\/g, '/');
  return `vault://${normalized}`;
}

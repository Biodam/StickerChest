export function getVaultImageUrl(filePath: string | undefined | null): string {
  if (!filePath) return '';
  return `vault://media?path=${encodeURIComponent(filePath)}`;
}

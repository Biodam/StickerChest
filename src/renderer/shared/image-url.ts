export function getChestImageUrl(filePath: string | undefined | null): string {
  if (!filePath) return '';
  return `chest://media?path=${encodeURIComponent(filePath)}`;
}

export const getVaultImageUrl = getChestImageUrl;


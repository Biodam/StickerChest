import { GeminiStickerResponse } from './types';

export function parseGeminiResponse(rawText: string): GeminiStickerResponse {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ...)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);

    const character = typeof parsed.character === 'string' && parsed.character.trim()
      ? parsed.character.trim()
      : null;

    const source = typeof parsed.source === 'string' && parsed.source.trim()
      ? parsed.source.trim()
      : null;

    const action = typeof parsed.action === 'string' && parsed.action.trim()
      ? parsed.action.trim()
      : 'reaction';

    const feeling = typeof parsed.feeling === 'string' && parsed.feeling.trim()
      ? parsed.feeling.trim()
      : 'neutral';

    const description = typeof parsed.description === 'string' && parsed.description.trim()
      ? parsed.description.trim()
      : 'Sticker item';

    let tags: string[] = [];
    if (Array.isArray(parsed.tags)) {
      tags = parsed.tags
        .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
        .map((t: string) => t.trim().toLowerCase());
    }

    return {
      character,
      source,
      action,
      feeling,
      tags,
      description,
    };
  } catch (err) {
    // If strict JSON parsing failed, attempt basic extraction
    return fallbackExtract(cleaned);
  }
}

function fallbackExtract(raw: string): GeminiStickerResponse {
  // Extract words for fallback tags
  const words = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && w.length < 20)
    .slice(0, 8);

  return {
    character: null,
    source: null,
    action: 'reaction',
    feeling: 'expressive',
    tags: Array.from(new Set(words)),
    description: raw.slice(0, 100).trim() || 'Sticker reaction',
  };
}

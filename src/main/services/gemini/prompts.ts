export const GEMINI_STICKER_SYSTEM_PROMPT = `
You are an expert anime, gaming, pop-culture, and internet meme archivist specializing in stickers, reaction images, and emojis.
Analyze this sticker/reaction image and return a strictly valid JSON object matching this schema:
{
  "character": string or null (name of the specific fictional character or real-world personality if identifiable, else null),
  "source": string or null (name of the anime, manga, video game, vtuber group, or meme origin, else null),
  "action": string (the visible physical gesture, expression, or activity, e.g. "saluting", "drinking tea", "screaming into pillow"),
  "feeling": string (the emotional vibe or conversational reaction, e.g. "sarcastic approval", "despair", "pure joy", "exhaustion"),
  "tags": list of lowercase single-word or hyphenated keywords for search indexing (include slang, reactions, feelings, character aliases),
  "description": string (one concise sentence describing the sticker)
}
Do not output markdown code blocks (such as \`\`\`json), only raw valid JSON.
`.trim();

export const GEMINI_JSON_SCHEMA = {
  type: 'object',
  properties: {
    character: { type: ['string', 'null'] },
    source: { type: ['string', 'null'] },
    action: { type: 'string' },
    feeling: { type: 'string' },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    description: { type: 'string' },
  },
  required: ['character', 'source', 'action', 'feeling', 'tags', 'description'],
};

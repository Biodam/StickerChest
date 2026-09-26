import { GoogleGenAI } from '@google/genai';
import { GEMINI_STICKER_SYSTEM_PROMPT } from './prompts';
import { parseGeminiResponse } from './parser';
import { GeminiStickerResponse } from './types';

let globalApiKey: string | null = process.env.GEMINI_API_KEY || null;
let globalModel = 'gemini-3.8-flash';

export function setGeminiApiKey(key: string): void {
  globalApiKey = key.trim();
}

export function getGeminiApiKey(): string | null {
  return globalApiKey;
}

export function setGeminiModel(model: string): void {
  let cleaned = model.replace(/^models\//, '').trim() || 'gemini-3.8-flash';
  if (cleaned === 'gemini-2.5-flash') cleaned = 'gemini-3.8-flash';
  globalModel = cleaned;
}

export function getGeminiModel(): string {
  if (globalModel === 'gemini-2.5-flash') globalModel = 'gemini-3.8-flash';
  return globalModel;
}

export async function testGeminiApiKey(
  apiKey: string,
  modelName = globalModel
): Promise<{ valid: boolean; message?: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, message: 'API key is too short or empty' };
  }

  let cleanModel = (modelName || globalModel).replace(/^models\//, '').trim() || 'gemini-3.8-flash';
  if (cleanModel === 'gemini-2.5-flash') cleanModel = 'gemini-3.8-flash';

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: cleanModel,
      contents: ['Respond with "OK".'],
    });

    const text = response.text || '';
    if (text.includes('OK') || text.length > 0) {
      return { valid: true };
    }
    return { valid: false, message: 'Unexpected response from Gemini' };
  } catch (err: any) {
    return { valid: false, message: err?.message || 'Failed to authenticate with Gemini API' };
  }
}

export async function requestGeminiTagging(
  buffer: Buffer,
  mimeType: string
): Promise<GeminiStickerResponse> {
  if (!globalApiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  let modelToUse = globalModel;
  if (modelToUse === 'gemini-2.5-flash') modelToUse = 'gemini-3.8-flash';

  const ai = new GoogleGenAI({ apiKey: globalApiKey });

  const response = await ai.models.generateContent({
    model: modelToUse,
    contents: [
      {
        role: 'user',
        parts: [
          { text: GEMINI_STICKER_SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: buffer.toString('base64'),
            },
          },
        ],
      },
    ],
  });

  const responseText = response.text || '';
  return parseGeminiResponse(responseText);
}

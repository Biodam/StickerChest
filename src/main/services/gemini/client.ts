import { GoogleGenAI } from '@google/genai';
import { GEMINI_STICKER_SYSTEM_PROMPT } from './prompts';
import { parseGeminiResponse } from './parser';
import { GeminiStickerResponse } from './types';

let globalApiKey: string | null = process.env.GEMINI_API_KEY || null;
let globalModel = 'gemini-2.5-flash';

export function setGeminiApiKey(key: string): void {
  globalApiKey = key.trim();
}

export function getGeminiApiKey(): string | null {
  return globalApiKey;
}

export function setGeminiModel(model: string): void {
  globalModel = model;
}

export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, message: 'API key is too short or empty' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: globalModel,
      contents: ['Respond with the single word "OK" if this test ping succeeds.'],
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

  const ai = new GoogleGenAI({ apiKey: globalApiKey });

  const response = await ai.models.generateContent({
    model: globalModel,
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

import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';
import { parseGeminiResponse } from '../../src/main/services/gemini/parser';
import { GEMINI_STICKER_SYSTEM_PROMPT } from '../../src/main/services/gemini/prompts';
import { setGeminiApiKey, getGeminiApiKey } from '../../src/main/services/gemini/client';

describe('Gemini AI Vision Metadata Service', () => {
  it('should contain required schema instructions in prompt', () => {
    expect(GEMINI_STICKER_SYSTEM_PROMPT).toContain('"character"');
    expect(GEMINI_STICKER_SYSTEM_PROMPT).toContain('"source"');
    expect(GEMINI_STICKER_SYSTEM_PROMPT).toContain('"action"');
    expect(GEMINI_STICKER_SYSTEM_PROMPT).toContain('"feeling"');
    expect(GEMINI_STICKER_SYSTEM_PROMPT).toContain('"tags"');
  });

  it('should parse clean JSON response', () => {
    const raw = JSON.stringify({
      character: 'Hatsune Miku',
      source: 'Vocaloid',
      action: 'waving hello',
      feeling: 'cheerful',
      tags: ['miku', 'vocaloid', 'wave', 'cute'],
      description: 'Hatsune Miku cheerfully waving at the viewer.',
    });

    const parsed = parseGeminiResponse(raw);
    expect(parsed.character).toBe('Hatsune Miku');
    expect(parsed.source).toBe('Vocaloid');
    expect(parsed.action).toBe('waving hello');
    expect(parsed.feeling).toBe('cheerful');
    expect(parsed.tags).toContain('miku');
    expect(parsed.tags).toContain('wave');
    expect(parsed.description).toContain('waving');
  });

  it('should parse markdown-fenced JSON response', () => {
    const fenced = `\`\`\`json
    {
      "character": null,
      "source": "Internet Meme",
      "action": "shrugging shoulders",
      "feeling": "indifference / confusion",
      "tags": ["shrug", "dunno", "meme"],
      "description": "A character shrugging in confusion."
    }
    \`\`\``;

    const parsed = parseGeminiResponse(fenced);
    expect(parsed.character).toBeNull();
    expect(parsed.source).toBe('Internet Meme');
    expect(parsed.action).toBe('shrugging shoulders');
    expect(parsed.feeling).toBe('indifference / confusion');
    expect(parsed.tags).toContain('shrug');
  });

  it('should gracefully handle malformed response with fallback words', () => {
    const malformed = 'This is an anime character screaming with immense power and aura';
    const parsed = parseGeminiResponse(malformed);

    expect(parsed.action).toBeDefined();
    expect(parsed.feeling).toBeDefined();
    expect(parsed.tags.length).toBeGreaterThan(0);
    expect(parsed.tags).toContain('character');
    expect(parsed.tags).toContain('screaming');
  });

  it('should update database metadata and enable FTS5 search with AI tags', () => {
    const db = new Database(':memory:');
    initializeSchema(db);
    const dal = new StickerDatabaseDAL(db);

    const itemId = dal.upsertItem({
      sha256Hash: 'gemini-test-hash',
      filename: 'anya_smug.webp',
      originalPath: '/vault/raw/anya_smug.webp',
      ext: '.webp',
      mimeType: 'image/webp',
      width: 512,
      height: 512,
      fileSizeBytes: 50000,
      isAnimated: false,
    });

    // Simulate applying parsed Gemini response to database
    const fakeAiResponse = parseGeminiResponse(
      JSON.stringify({
        character: 'Anya Forger',
        source: 'Spy x Family',
        action: 'smug face',
        feeling: 'condescending smirk',
        tags: ['anya', 'heh', 'smug', 'telepath'],
        description: 'Anya showing her iconic smirk.',
      })
    );

    dal.saveMetadata({
      itemId,
      character: fakeAiResponse.character,
      sourceOrigin: fakeAiResponse.source,
      action: fakeAiResponse.action,
      feeling: fakeAiResponse.feeling,
      description: fakeAiResponse.description,
      aiModel: 'gemini-2.5-flash',
      aiStatus: 'completed',
      tags: fakeAiResponse.tags,
      rawAiJson: JSON.stringify(fakeAiResponse),
    });

    // Verify search matches character
    const charSearch = dal.searchItems({ query: 'Anya' });
    expect(charSearch.total).toBe(1);

    // Verify search matches feeling
    const feelSearch = dal.searchItems({ query: 'smirk' });
    expect(feelSearch.total).toBe(1);

    // Verify search matches AI tag
    const tagSearch = dal.searchItems({ query: 'telepath' });
    expect(tagSearch.total).toBe(1);

    db.close();
  });

  it('should manage API key and model setters and getters', async () => {
    const { setGeminiModel, getGeminiModel } = await import('../../src/main/services/gemini/client');
    setGeminiApiKey('test-key-12345');
    expect(getGeminiApiKey()).toBe('test-key-12345');

    setGeminiModel('models/gemini-3.8-flash');
    expect(getGeminiModel()).toBe('gemini-3.8-flash');
  });
});

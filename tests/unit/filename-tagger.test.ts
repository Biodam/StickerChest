import { describe, it, expect } from 'vitest';
import { parseTagsFromFilename } from '../../src/main/services/ingestion/filename-tagger';
import { buildGeminiTaggingPrompt } from '../../src/main/services/gemini/prompts';

describe('Filename Tag Parser & Context Extraction', () => {
  it('should parse character and emotion from snake_case filename', () => {
    const tags = parseTagsFromFilename('miku_happy_dance.png');
    expect(tags).toContain('miku');
    expect(tags).toContain('happy');
    expect(tags).toContain('dance');
    expect(tags).toContain('miku happy dance');
  });

  it('should parse character and emotion from kebab-case filename', () => {
    const tags = parseTagsFromFilename('anya-smug-grin.gif');
    expect(tags).toContain('anya');
    expect(tags).toContain('smug');
    expect(tags).toContain('grin');
    expect(tags).toContain('anya smug grin');
  });

  it('should parse CamelCase names and emotion tokens', () => {
    const tags = parseTagsFromFilename('HatsuneMikuSurprised.webp');
    expect(tags).toContain('hatsune');
    expect(tags).toContain('miku');
    expect(tags).toContain('surprised');
    expect(tags).toContain('hatsune miku surprised');
  });

  it('should strip common file noise, duplicates, and resolutions', () => {
    const tags = parseTagsFromFilename('rem_crying_512x512_(1).png');
    expect(tags).toContain('rem');
    expect(tags).toContain('crying');
    expect(tags).not.toContain('512x512');
    expect(tags).not.toContain('1');
    expect(tags).not.toContain('png');
  });

  it('should filter out generic camera prefixes and pure numeric timestamps', () => {
    const tags = parseTagsFromFilename('IMG_20240926_frieren_sleepy.png');
    expect(tags).toContain('frieren');
    expect(tags).toContain('sleepy');
    expect(tags).not.toContain('img');
    expect(tags).not.toContain('20240926');
  });

  it('should handle paths with directories gracefully', () => {
    const tags = parseTagsFromFilename('C:/Stickers/Anime/goku_super_saiyan.png');
    expect(tags).toContain('goku');
    expect(tags).toContain('super');
    expect(tags).toContain('saiyan');
  });

  it('should include filename context in Gemini prompt directive', () => {
    const defaultPrompt = buildGeminiTaggingPrompt();
    expect(defaultPrompt).not.toContain('Image filename context');

    const promptWithFilename = buildGeminiTaggingPrompt('miku_shocked_screaming.png');
    expect(promptWithFilename).toContain('Image filename context: "miku_shocked_screaming.png"');
    expect(promptWithFilename).toContain('hint');
  });
});

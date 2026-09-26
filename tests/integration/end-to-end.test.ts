import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import Database from 'better-sqlite3';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';
import { setCustomVaultRoot } from '../../src/main/services/ingestion/paths';
import { ingestImageFile } from '../../src/main/services/ingestion/coordinator';
import { parseGeminiResponse } from '../../src/main/services/gemini/parser';

describe('End-to-End Vault Ingestion, AI Tagging & Search Workflow', () => {
  const testDir = path.resolve(process.cwd(), '.e2e-test-assets');
  const testVault = path.join(testDir, 'vault');
  const testImage = path.join(testDir, 'miku_thumbsup.png');
  let db: any;
  let dal: StickerDatabaseDAL;

  beforeAll(async () => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    setCustomVaultRoot(testVault);

    // Create test image
    await sharp({
      create: {
        width: 600,
        height: 600,
        channels: 4,
        background: { r: 0, g: 200, b: 200, alpha: 1 },
      },
    })
      .png()
      .toFile(testImage);

    db = new Database(':memory:');
    initializeSchema(db);
    dal = new StickerDatabaseDAL(db);
  });

  afterAll(() => {
    db.close();
    try {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch {
      // Best effort cleanup
    }
  });

  it('should run full lifecycle: ingest -> resize -> tag -> search -> copy -> recent', async () => {
    // 1. Ingest image
    const ingestResult = await ingestImageFile(testImage, dal);
    expect(ingestResult.itemId).toBeDefined();
    expect(ingestResult.isNew).toBe(true);

    const item = dal.getItemById(ingestResult.itemId);
    expect(item).not.toBeNull();
    expect(item?.variants.sticker).not.toBeNull();
    expect(item?.variants.emoji).not.toBeNull();
    expect(item?.variants.thumb).not.toBeNull();

    // 2. Simulate Gemini AI vision output
    const fakeGeminiOutput = parseGeminiResponse(`\`\`\`json
    {
      "character": "Hatsune Miku",
      "source": "Vocaloid",
      "action": "thumbs up approval",
      "feeling": "encouraging and cheerful",
      "tags": ["miku", "vocaloid", "approve", "cute", "anime"],
      "description": "Miku giving a cheerful thumbs up."
    }
    \`\`\``);

    dal.saveMetadata({
      itemId: ingestResult.itemId,
      character: fakeGeminiOutput.character,
      sourceOrigin: fakeGeminiOutput.source,
      action: fakeGeminiOutput.action,
      feeling: fakeGeminiOutput.feeling,
      description: fakeGeminiOutput.description,
      aiModel: 'gemini-2.5-flash',
      aiStatus: 'completed',
      tags: fakeGeminiOutput.tags,
      rawAiJson: JSON.stringify(fakeGeminiOutput),
    });

    // 3. Search across different dimensions
    const searchChar = dal.searchItems({ query: 'Miku' });
    expect(searchChar.total).toBe(1);

    const searchAction = dal.searchItems({ query: 'approval' });
    expect(searchAction.total).toBe(1);

    const searchFeeling = dal.searchItems({ query: 'encouraging' });
    expect(searchFeeling.total).toBe(1);

    const searchTag = dal.searchItems({ query: 'cute' });
    expect(searchTag.total).toBe(1);

    // 4. Toggle favorite
    expect(dal.getUsageStats(ingestResult.itemId).isFavorite).toBe(false);
    dal.toggleFavorite(ingestResult.itemId, true);
    expect(dal.getUsageStats(ingestResult.itemId).isFavorite).toBe(true);

    const favSearch = dal.searchItems({ tab: 'favorites' });
    expect(favSearch.total).toBe(1);

    // 5. Simulate usage (copying)
    dal.recordItemUsage(ingestResult.itemId);
    const usage = dal.getUsageStats(ingestResult.itemId);
    expect(usage.copyCount).toBe(1);
    expect(usage.lastCopiedAt).not.toBeNull();

    const recentSearch = dal.searchItems({ tab: 'recent' });
    expect(recentSearch.total).toBe(1);
    expect(recentSearch.items[0].id).toBe(ingestResult.itemId);
  });
});

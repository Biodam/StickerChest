import { describe, it, expect } from 'vitest';

describe('Project Scaffolding & Environment', () => {
  it('should verify Node environment and basic assertions', () => {
    expect(true).toBe(true);
  });

  it('should verify sharp can be imported and initialized', async () => {
    const sharp = await import('sharp');
    expect(sharp.default).toBeDefined();
  });

  it('should verify better-sqlite3 in-memory database works with FTS5', async () => {
    const Database = (await import('better-sqlite3')).default;
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE test (id TEXT PRIMARY KEY, name TEXT);
      CREATE VIRTUAL TABLE test_fts USING fts5(name);
      INSERT INTO test VALUES ('1', 'Anya Smug Face');
      INSERT INTO test_fts (name) VALUES ('Anya Smug Face');
    `);
    const results = db.prepare(`SELECT * FROM test_fts WHERE test_fts MATCH 'Anya*'`).all();
    expect(results).toHaveLength(1);
    db.close();
  });
});

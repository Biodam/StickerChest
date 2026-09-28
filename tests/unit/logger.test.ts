import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { logger } from '../../src/main/services/logger/logger';

describe('Logger Service', () => {
  it('should write logs to persistent file and read them back', () => {
    const testTag = 'UnitTest';
    const testMsg = `Log test message ${Date.now()}`;

    logger.info(testTag, testMsg, { foo: 'bar' });

    const logPath = logger.getLogPath();
    expect(fs.existsSync(logPath)).toBe(true);

    const recent = logger.readRecentLogs(20);
    expect(recent.length).toBeGreaterThan(0);
    const found = recent.some((line) => line.includes(testTag) && line.includes(testMsg) && line.includes('bar'));
    expect(found).toBe(true);
  });
});

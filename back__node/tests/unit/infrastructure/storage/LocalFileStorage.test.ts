import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import { LocalFileStorage } from '../../../../src/infrastructure/storage/LocalFileStorage';

describe('LocalFileStorage', () => {
  let baseDir: string;
  let storage: LocalFileStorage;

  beforeEach(async () => {
    baseDir = path.join(os.tmpdir(), `datashare-test-${Date.now()}`);
    await fs.mkdir(baseDir, { recursive: true });
    storage = new LocalFileStorage(baseDir);
  });

  it('put puis read retourne les mêmes données', async () => {
    const key = 'key1';
    const data = Buffer.from('hello');
    await storage.put(key, data);
    const read = await storage.read(key);
    expect(read).toEqual(data);
  });

  it('exists retourne true après put', async () => {
    await storage.put('k', Buffer.from('x'));
    expect(await storage.exists('k')).toBe(true);
  });

  it('exists retourne false pour clé inexistante', async () => {
    expect(await storage.exists('nonexistent')).toBe(false);
  });

  it('read retourne null pour fichier absent', async () => {
    expect(await storage.read('absent')).toBe(null);
  });

  it('delete retire le fichier', async () => {
    await storage.put('d1', Buffer.from('x'));
    expect(await storage.exists('d1')).toBe(true);
    await storage.delete('d1');
    expect(await storage.exists('d1')).toBe(false);
  });

  it('delete est idempotent (pas d’erreur si absent)', async () => {
    await expect(storage.delete('absent')).resolves.not.toThrow();
  });
});

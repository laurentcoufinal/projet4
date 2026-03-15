import fs from 'node:fs/promises';
import path from 'node:path';
import type { FileStorage } from '../../domain/ports/FileStorage';

export class LocalFileStorage implements FileStorage {
  constructor(private readonly baseDir: string) {}

  private resolvePath(storageKey: string): string {
    return path.join(this.baseDir, storageKey);
  }

  async put(storageKey: string, data: Buffer): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.writeFile(this.resolvePath(storageKey), data);
  }

  async read(storageKey: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(this.resolvePath(storageKey));
    } catch {
      return null;
    }
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await fs.unlink(this.resolvePath(storageKey));
    } catch {
      // idempotent delete
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      await fs.access(this.resolvePath(storageKey));
      return true;
    } catch {
      return false;
    }
  }
}

export interface StoredFile {
  storageKey: string;
  size: number;
  mimeType: string;
}

export interface FileStorage {
  put(storageKey: string, data: Buffer): Promise<void>;
  read(storageKey: string): Promise<Buffer | null>;
  delete(storageKey: string): Promise<void>;
  exists(storageKey: string): Promise<boolean>;
}

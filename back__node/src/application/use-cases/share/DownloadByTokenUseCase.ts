import type { FileRepository } from '../../../domain/ports/FileRepository';
import type { FileStorage } from '../../../domain/ports/FileStorage';
import { AppError } from '../../../shared/errors/AppError';
import { Errors } from '../../../shared/errors/errors';

export class DownloadByTokenUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileStorage: FileStorage
  ) {}

  async execute(token: string): Promise<{ name: string; mimeType: string; data: Buffer }> {
    const link = await this.fileRepository.findShareLinkByToken(token);
    if (!link) throw Errors.notFound('Lien invalide.');
    if (link.expiresAt.getTime() < Date.now()) {
      throw new AppError('LINK_EXPIRED', 'Ce lien a expiré.', 410);
    }

    const file = await this.fileRepository.findById(link.fileId);
    if (!file) throw Errors.notFound('Fichier introuvable.');
    const data = await this.fileStorage.read(file.storageKey);
    if (!data) throw Errors.notFound('Fichier introuvable.');

    return { name: file.name, mimeType: file.mimeType, data };
  }
}

import type { FileRepository } from '../../../domain/ports/FileRepository';
import type { FileStorage } from '../../../domain/ports/FileStorage';
import type { PasswordHasher } from '../../../domain/ports/PasswordHasher';
import { AppError } from '../../../shared/errors/AppError';
import { Errors } from '../../../shared/errors/errors';

export class DownloadFileUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileStorage: FileStorage,
    private readonly passwordHasher: PasswordHasher
  ) {}

  private async canAccess(fileId: string, userId: string): Promise<boolean> {
    const list = await this.fileRepository.listVisibleByUser(userId);
    return list.some((item) => item.file.id === fileId);
  }

  async execute(fileId: string, requesterUserId: string): Promise<{ name: string; mimeType: string; data: Buffer }> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw Errors.notFound('Fichier introuvable.');
    if (!(await this.canAccess(file.id, requesterUserId))) {
      throw Errors.forbidden('Accès non autorisé.');
    }
    if (file.passwordHash) {
      throw new AppError('FILE_PASSWORD_REQUIRED', 'Ce fichier est protégé par mot de passe.', 403);
    }
    const data = await this.fileStorage.read(file.storageKey);
    if (!data) throw Errors.notFound('Fichier introuvable.');

    return { name: file.name, mimeType: file.mimeType, data };
  }

  async executeWithPassword(
    fileId: string,
    requesterUserId: string,
    password: string
  ): Promise<{ name: string; mimeType: string; data: Buffer }> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw Errors.notFound('Fichier introuvable.');
    if (!(await this.canAccess(file.id, requesterUserId))) {
      throw Errors.forbidden('Accès non autorisé.');
    }
    if (!file.passwordHash) {
      throw Errors.badRequest("Ce fichier n'est pas protégé par mot de passe.");
    }
    const ok = await this.passwordHasher.compare(password, file.passwordHash);
    if (!ok) {
      throw Errors.unauthorized('Mot de passe incorrect.');
    }
    const data = await this.fileStorage.read(file.storageKey);
    if (!data) throw Errors.notFound('Fichier introuvable.');

    return { name: file.name, mimeType: file.mimeType, data };
  }
}

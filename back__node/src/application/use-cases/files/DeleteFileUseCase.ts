import type { FileRepository } from '../../../domain/ports/FileRepository';
import type { FileStorage } from '../../../domain/ports/FileStorage';
import { Errors } from '../../../shared/errors/errors';

export class DeleteFileUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileStorage: FileStorage
  ) {}

  async execute(fileId: string, requesterUserId: string): Promise<{ message: string }> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw Errors.notFound('Fichier introuvable.');
    }
    if (file.ownerUserId !== requesterUserId) {
      throw Errors.forbidden('Seul le propriétaire peut supprimer ce fichier.');
    }

    await this.fileStorage.delete(file.storageKey);
    await this.fileRepository.deleteById(file.id);
    return { message: 'Fichier supprimé.' };
  }
}

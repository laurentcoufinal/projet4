import type { FileRepository } from '../../../domain/ports/FileRepository';
import { Errors } from '../../../shared/errors/errors';

export class UnshareFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(fileId: string, ownerUserId: string, targetUserId: string): Promise<{ message: string }> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw Errors.notFound('Fichier introuvable.');
    if (file.ownerUserId !== ownerUserId) {
      throw Errors.forbidden('Seul le propriétaire peut révoquer un partage.');
    }

    const deleted = await this.fileRepository.deleteShare(file.id, targetUserId);
    if (!deleted) {
      throw Errors.notFound('Aucun partage trouvé pour cet utilisateur.');
    }
    return { message: 'Partage révoqué.' };
  }
}

import type { FileRepository } from '../../../domain/ports/FileRepository';
import type { UserRepository } from '../../../domain/ports/UserRepository';
import { Errors } from '../../../shared/errors/errors';

export class ShareFileUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(fileId: string, ownerUserId: string, target: { userId?: string; email?: string }) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw Errors.notFound('Fichier introuvable.');
    if (file.ownerUserId !== ownerUserId) {
      throw Errors.forbidden('Seul le propriétaire peut partager ce fichier.');
    }

    const targetUser = target.userId
      ? await this.userRepository.findById(target.userId)
      : target.email
        ? await this.userRepository.findByEmail(target.email.toLowerCase())
        : null;

    if (!targetUser) {
      throw Errors.validation('Utilisateur cible introuvable.');
    }
    if (targetUser.id === ownerUserId) {
      throw Errors.validation('Vous ne pouvez pas vous partager un fichier à vous-même.');
    }

    const alreadyShared = await this.fileRepository.hasShare(file.id, targetUser.id);
    if (alreadyShared) {
      return {
        statusCode: 200,
        body: {
          message: 'Le fichier est déjà partagé avec cet utilisateur.',
          user_id: targetUser.id,
          email: targetUser.email,
        },
      };
    }

    await this.fileRepository.createShare(file.id, targetUser.id);
    return {
      statusCode: 201,
      body: {
        message: 'Fichier partagé en lecture.',
        user_id: targetUser.id,
        email: targetUser.email,
      },
    };
  }
}

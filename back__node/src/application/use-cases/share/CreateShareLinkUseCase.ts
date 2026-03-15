import crypto from 'node:crypto';
import type { FileRepository } from '../../../domain/ports/FileRepository';
import { SHARE_LINK_DEFAULT_EXPIRES_IN_DAYS } from '../../../shared/constants/domainPolicies';
import { Errors } from '../../../shared/errors/errors';
import { assertShareLinkDays } from '../../../domain/services/fileRules';

export class CreateShareLinkUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(
    fileId: string,
    ownerUserId: string,
    baseUrl: string,
    expiresInDays?: number
  ): Promise<{ message: string; url: string; token: string; expires_at: string }> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw Errors.notFound('Fichier introuvable.');
    if (file.ownerUserId !== ownerUserId) {
      throw Errors.forbidden('Seul le propriétaire peut créer un lien de partage.');
    }

    const days = expiresInDays ?? SHARE_LINK_DEFAULT_EXPIRES_IN_DAYS;
    assertShareLinkDays(days);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.fileRepository.createShareLink(file.id, token, expiresAt);
    await this.fileRepository.setFileExpiresAtIfMissing(file.id, expiresAt);

    return {
      message: 'Lien de partage créé.',
      url: `${baseUrl.replace(/\/$/, '')}/api/v1/s/${token}`,
      token,
      expires_at: expiresAt.toISOString(),
    };
  }
}

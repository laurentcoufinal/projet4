import path from 'node:path';
import {
  FILE_MAX_SIZE_BYTES,
  FILE_PASSWORD_MIN_LENGTH,
  FORBIDDEN_FILE_EXTENSIONS,
  SHARE_LINK_MAX_EXPIRES_IN_DAYS,
  SHARE_LINK_MIN_EXPIRES_IN_DAYS,
  USER_PASSWORD_MIN_LENGTH,
} from '../../shared/constants/domainPolicies';
import { Errors } from '../../shared/errors/errors';

export function assertUserPassword(password: string): void {
  if (password.length < USER_PASSWORD_MIN_LENGTH) {
    throw Errors.validation(`Le mot de passe doit contenir au moins ${USER_PASSWORD_MIN_LENGTH} caractères.`);
  }
}

export function assertFilePassword(password: string): void {
  if (password.length < FILE_PASSWORD_MIN_LENGTH) {
    throw Errors.validation(`Le mot de passe fichier doit contenir au moins ${FILE_PASSWORD_MIN_LENGTH} caractères.`);
  }
}

export function assertFileSize(size: number): void {
  if (size > FILE_MAX_SIZE_BYTES) {
    throw Errors.validation('La taille du fichier dépasse la limite de 1 Go.');
  }
}

export function assertAllowedExtension(fileName: string): void {
  const extension = path.extname(fileName).toLowerCase();
  if (FORBIDDEN_FILE_EXTENSIONS.includes(extension)) {
    throw Errors.validation(`Extension interdite: ${extension}`);
  }
}

export function assertShareLinkDays(days: number): void {
  if (days < SHARE_LINK_MIN_EXPIRES_IN_DAYS || days > SHARE_LINK_MAX_EXPIRES_IN_DAYS) {
    throw Errors.validation(
      `La durée d'expiration doit être comprise entre ${SHARE_LINK_MIN_EXPIRES_IN_DAYS} et ${SHARE_LINK_MAX_EXPIRES_IN_DAYS} jours.`
    );
  }
}

export function normalizeTagLabel(value: string): string {
  return value.trim().toLowerCase();
}

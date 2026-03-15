import { describe, expect, it } from 'vitest';
import {
  assertAllowedExtension,
  assertFilePassword,
  assertFileSize,
  assertShareLinkDays,
  assertUserPassword,
  normalizeTagLabel,
} from '../../../src/domain/services/fileRules';

describe('fileRules', () => {
  describe('assertUserPassword', () => {
    it('ne lance pas si >= 8 caractères', () => {
      expect(() => assertUserPassword('12345678')).not.toThrow();
      expect(() => assertUserPassword('longpassword')).not.toThrow();
    });
    it('lance une erreur de validation si < 8 caractères', () => {
      expect(() => assertUserPassword('short')).toThrow(/8 caractères/);
      expect(() => assertUserPassword('')).toThrow();
    });
  });

  describe('assertFilePassword', () => {
    it('ne lance pas si >= 6 caractères', () => {
      expect(() => assertFilePassword('123456')).not.toThrow();
    });
    it('lance une erreur si < 6 caractères', () => {
      expect(() => assertFilePassword('12345')).toThrow(/6 caractères/);
    });
  });

  describe('assertFileSize', () => {
    it('ne lance pas si <= 1 Go', () => {
      expect(() => assertFileSize(0)).not.toThrow();
      expect(() => assertFileSize(1024 * 1024 * 1024)).not.toThrow();
    });
    it('lance une erreur si > 1 Go', () => {
      expect(() => assertFileSize(1024 * 1024 * 1024 + 1)).toThrow(/1 Go/);
    });
  });

  describe('assertAllowedExtension', () => {
    it('ne lance pas pour extensions autorisées', () => {
      expect(() => assertAllowedExtension('doc.pdf')).not.toThrow();
      expect(() => assertAllowedExtension('image.png')).not.toThrow();
      expect(() => assertAllowedExtension('file')).not.toThrow();
    });
    it('lance une erreur pour .exe, .bat, .cmd, .sh, .msi', () => {
      expect(() => assertAllowedExtension('run.exe')).toThrow(/Extension interdite/);
      expect(() => assertAllowedExtension('script.bat')).toThrow(/\.bat/);
      expect(() => assertAllowedExtension('install.msi')).toThrow();
    });
  });

  describe('assertShareLinkDays', () => {
    it('accepte entre 1 et 7 jours', () => {
      expect(() => assertShareLinkDays(1)).not.toThrow();
      expect(() => assertShareLinkDays(7)).not.toThrow();
      expect(() => assertShareLinkDays(4)).not.toThrow();
    });
    it('lance une erreur si < 1 ou > 7', () => {
      expect(() => assertShareLinkDays(0)).toThrow(/1 et 7/);
      expect(() => assertShareLinkDays(8)).toThrow(/1 et 7/);
    });
  });

  describe('normalizeTagLabel', () => {
    it('trim et lowercase', () => {
      expect(normalizeTagLabel('  Work  ')).toBe('work');
      expect(normalizeTagLabel('DRAFT')).toBe('draft');
    });
  });
});

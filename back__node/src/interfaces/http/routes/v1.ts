import { Router } from 'express';
import multer from 'multer';
import type { AppContainer } from '../../../container';
import { AppError } from '../../../shared/errors/AppError';
import { Errors } from '../../../shared/errors/errors';
import { authenticate } from '../middleware/authenticate';
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import {
  loginSchema,
  passwordDownloadSchema,
  registerSchema,
  shareLinkSchema,
  shareSchema,
  uploadFormSchema,
} from '../validators/schemas';
import { validate } from '../validators/validate';

const upload = multer({ storage: multer.memoryStorage() });

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t));
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map((t) => String(t));
    } catch {
      return tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function buildV1Router(container: AppContainer): Router {
  const router = Router();
  const authGuard = authenticate(container.tokenService);

  router.post('/register', async (req, res, next) => {
    try {
      const payload = validate(registerSchema, req.body);
      if (payload.password !== payload.password_confirmation) {
        throw Errors.validation('Les mots de passe ne correspondent pas.', {
          password: ['password confirmation mismatch'],
        });
      }
      const out = await container.useCases.registerUser.execute(payload);
      res.status(201).json(out);
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const payload = validate(loginSchema, req.body);
      const out = await container.useCases.login.execute(payload);
      res.status(200).json(out);
    } catch (error) {
      next(error);
    }
  });

  router.get('/s/:token', async (req, res, next) => {
    try {
      const out = await container.useCases.downloadByToken.execute(req.params.token);
      res.setHeader('Content-Type', out.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(out.name)}"`);
      res.status(200).send(out.data);
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout', authGuard, async (_req, res) => {
    res.status(200).json({ message: 'Déconnexion réussie' });
  });

  router.get('/user', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const out = await container.useCases.getCurrentUser.execute(req.auth!.userId);
      res.status(200).json(out);
    } catch (error) {
      next(error);
    }
  });

  router.post('/files', authGuard, upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) throw Errors.validation('Le fichier est requis.', { file: ['required'] });
      const body = validate(uploadFormSchema, req.body);
      const out = await container.useCases.uploadFile.execute({
        ownerUserId: req.auth!.userId,
        originalName: req.file.originalname,
        customName: body.name,
        mimeType: req.file.mimetype,
        data: req.file.buffer,
        tags: parseTags(body.tags),
        password: body.password,
      });
      res.status(201).json(out);
    } catch (error) {
      next(error);
    }
  });

  router.get('/files', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const out = await container.useCases.listFiles.execute(req.auth!.userId);
      res.status(200).json(out);
    } catch (error) {
      next(error);
    }
  });

  router.get('/files/:id/download', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const out = await container.useCases.downloadFile.execute(req.params.id, req.auth!.userId);
      res.setHeader('Content-Type', out.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(out.name)}"`);
      res.status(200).send(out.data);
    } catch (error) {
      if (error instanceof AppError && error.code === 'FILE_PASSWORD_REQUIRED') {
        res.status(403).json({
          message: 'Ce fichier est protégé par mot de passe.',
          requires_password: true,
        });
        return;
      }
      next(error);
    }
  });

  router.post('/files/:id/download', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = validate(passwordDownloadSchema, req.body);
      const out = await container.useCases.downloadFile.executeWithPassword(
        req.params.id,
        req.auth!.userId,
        body.password
      );
      res.setHeader('Content-Type', out.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(out.name)}"`);
      res.status(200).send(out.data);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/files/:id', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const out = await container.useCases.deleteFile.execute(req.params.id, req.auth!.userId);
      res.status(200).json(out);
    } catch (error) {
      next(error);
    }
  });

  router.post('/files/:id/share', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = validate(shareSchema, req.body);
      const out = await container.useCases.shareFile.execute(req.params.id, req.auth!.userId, {
        userId: body.user_id,
        email: body.email,
      });
      res.status(out.statusCode).json(out.body);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/files/:id/share/:userId', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const out = await container.useCases.unshareFile.execute(
        req.params.id,
        req.auth!.userId,
        req.params.userId
      );
      res.status(200).json(out);
    } catch (error) {
      next(error);
    }
  });

  router.post('/files/:id/share-link', authGuard, async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = validate(shareLinkSchema, req.body ?? {});
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const out = await container.useCases.createShareLink.execute(
        req.params.id,
        req.auth!.userId,
        baseUrl,
        body.expires_in_days
      );
      res.status(201).json(out);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { buildV1Router } from '../../src/interfaces/http/routes/v1';
import { errorHandler, notFoundHandler } from '../../src/interfaces/http/middleware/errorHandler';

function buildTestApp() {
  const container: any = {
    tokenService: {
      verify: vi.fn((token: string) => {
        if (token === 'good-token') {
          return { sub: 'u1', email: 'u1@example.com', name: 'User One' };
        }
        throw new Error('invalid token');
      }),
    },
    useCases: {
      registerUser: { execute: vi.fn(async () => ({ user: { id: 'u1', name: 'A', email: 'a@b.com' }, token: 't', token_type: 'Bearer' })) },
      login: { execute: vi.fn(async () => ({ user: { id: 'u1', name: 'A', email: 'a@b.com' }, token: 't', token_type: 'Bearer' })) },
      getCurrentUser: { execute: vi.fn(async () => ({ user: { id: 'u1', name: 'A', email: 'a@b.com' } })) },
      uploadFile: {
        execute: vi.fn(async () => ({
          id: 'f1',
          name: 'doc.txt',
          size: 3,
          mime_type: 'text/plain',
          tags: ['work'],
          created_at: new Date().toISOString(),
        })),
      },
      listFiles: { execute: vi.fn(async () => ({ data: [] })) },
      downloadFile: {
        execute: vi.fn(async () => ({ name: 'doc.txt', mimeType: 'text/plain', data: Buffer.from('abc') })),
        executeWithPassword: vi.fn(async () => ({ name: 'doc.txt', mimeType: 'text/plain', data: Buffer.from('abc') })),
      },
      deleteFile: { execute: vi.fn(async () => ({ message: 'Fichier supprimé.' })) },
      shareFile: {
        execute: vi.fn(async () => ({
          statusCode: 201,
          body: { message: 'Fichier partagé en lecture.', user_id: 'u2', email: 'u2@example.com' },
        })),
      },
      unshareFile: { execute: vi.fn(async () => ({ message: 'Partage révoqué.' })) },
      createShareLink: {
        execute: vi.fn(async () => ({
          message: 'Lien de partage créé.',
          url: 'http://localhost/api/v1/s/token',
          token: 'token',
          expires_at: new Date().toISOString(),
        })),
      },
      downloadByToken: {
        execute: vi.fn(async () => ({ name: 'doc.txt', mimeType: 'text/plain', data: Buffer.from('abc') })),
      },
    },
  };

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/v1', buildV1Router(container));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe('API v1', () => {
  it('POST /api/v1/register retourne token + user', async () => {
    const app = buildTestApp();
    const res = await request(app).post('/api/v1/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('a@b.com');
  });

  it('GET /api/v1/user exige un Bearer token valide', async () => {
    const app = buildTestApp();
    const unauthorized = await request(app).get('/api/v1/user');
    expect(unauthorized.status).toBe(401);

    const ok = await request(app).get('/api/v1/user').set('Authorization', 'Bearer good-token');
    expect(ok.status).toBe(200);
    expect(ok.body.user.id).toBe('u1');
  });

  it('POST /api/v1/files accepte multipart et répond 201', async () => {
    const app = buildTestApp();
    const res = await request(app)
      .post('/api/v1/files')
      .set('Authorization', 'Bearer good-token')
      .attach('file', Buffer.from('abc'), 'doc.txt')
      .field('name', 'doc.txt')
      .field('tags', JSON.stringify(['work']));

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('f1');
  });

  it('POST /api/v1/files/:id/share-link retourne url/token', async () => {
    const app = buildTestApp();
    const res = await request(app)
      .post('/api/v1/files/f1/share-link')
      .set('Authorization', 'Bearer good-token')
      .send({ expires_in_days: 7 });

    expect(res.status).toBe(201);
    expect(res.body.token).toBe('token');
    expect(res.body.url).toContain('/api/v1/s/token');
  });
});

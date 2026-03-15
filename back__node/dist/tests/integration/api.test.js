"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const v1_1 = require("../../src/interfaces/http/routes/v1");
const errorHandler_1 = require("../../src/interfaces/http/middleware/errorHandler");
function buildTestApp() {
    const container = {
        tokenService: {
            verify: vitest_1.vi.fn((token) => {
                if (token === 'good-token') {
                    return { sub: 'u1', email: 'u1@example.com', name: 'User One' };
                }
                throw new Error('invalid token');
            }),
        },
        useCases: {
            registerUser: { execute: vitest_1.vi.fn(async () => ({ user: { id: 'u1', name: 'A', email: 'a@b.com' }, token: 't', token_type: 'Bearer' })) },
            login: { execute: vitest_1.vi.fn(async () => ({ user: { id: 'u1', name: 'A', email: 'a@b.com' }, token: 't', token_type: 'Bearer' })) },
            getCurrentUser: { execute: vitest_1.vi.fn(async () => ({ user: { id: 'u1', name: 'A', email: 'a@b.com' } })) },
            uploadFile: {
                execute: vitest_1.vi.fn(async () => ({
                    id: 'f1',
                    name: 'doc.txt',
                    size: 3,
                    mime_type: 'text/plain',
                    tags: ['work'],
                    created_at: new Date().toISOString(),
                })),
            },
            listFiles: { execute: vitest_1.vi.fn(async () => ({ data: [] })) },
            downloadFile: {
                execute: vitest_1.vi.fn(async () => ({ name: 'doc.txt', mimeType: 'text/plain', data: Buffer.from('abc') })),
                executeWithPassword: vitest_1.vi.fn(async () => ({ name: 'doc.txt', mimeType: 'text/plain', data: Buffer.from('abc') })),
            },
            deleteFile: { execute: vitest_1.vi.fn(async () => ({ message: 'Fichier supprimé.' })) },
            shareFile: {
                execute: vitest_1.vi.fn(async () => ({
                    statusCode: 201,
                    body: { message: 'Fichier partagé en lecture.', user_id: 'u2', email: 'u2@example.com' },
                })),
            },
            unshareFile: { execute: vitest_1.vi.fn(async () => ({ message: 'Partage révoqué.' })) },
            createShareLink: {
                execute: vitest_1.vi.fn(async () => ({
                    message: 'Lien de partage créé.',
                    url: 'http://localhost/api/v1/s/token',
                    token: 'token',
                    expires_at: new Date().toISOString(),
                })),
            },
            downloadByToken: {
                execute: vitest_1.vi.fn(async () => ({ name: 'doc.txt', mimeType: 'text/plain', data: Buffer.from('abc') })),
            },
        },
    };
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/api/v1', (0, v1_1.buildV1Router)(container));
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
(0, vitest_1.describe)('API v1', () => {
    (0, vitest_1.it)('POST /api/v1/register retourne token + user', async () => {
        const app = buildTestApp();
        const res = await (0, supertest_1.default)(app).post('/api/v1/register').send({
            name: 'Alice',
            email: 'alice@example.com',
            password: 'password123',
            password_confirmation: 'password123',
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.token).toBeDefined();
        (0, vitest_1.expect)(res.body.user.email).toBe('a@b.com');
    });
    (0, vitest_1.it)('GET /api/v1/user exige un Bearer token valide', async () => {
        const app = buildTestApp();
        const unauthorized = await (0, supertest_1.default)(app).get('/api/v1/user');
        (0, vitest_1.expect)(unauthorized.status).toBe(401);
        const ok = await (0, supertest_1.default)(app).get('/api/v1/user').set('Authorization', 'Bearer good-token');
        (0, vitest_1.expect)(ok.status).toBe(200);
        (0, vitest_1.expect)(ok.body.user.id).toBe('u1');
    });
    (0, vitest_1.it)('POST /api/v1/files accepte multipart et répond 201', async () => {
        const app = buildTestApp();
        const res = await (0, supertest_1.default)(app)
            .post('/api/v1/files')
            .set('Authorization', 'Bearer good-token')
            .attach('file', Buffer.from('abc'), 'doc.txt')
            .field('name', 'doc.txt')
            .field('tags', JSON.stringify(['work']));
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.id).toBe('f1');
    });
    (0, vitest_1.it)('POST /api/v1/files/:id/share-link retourne url/token', async () => {
        const app = buildTestApp();
        const res = await (0, supertest_1.default)(app)
            .post('/api/v1/files/f1/share-link')
            .set('Authorization', 'Bearer good-token')
            .send({ expires_in_days: 7 });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.token).toBe('token');
        (0, vitest_1.expect)(res.body.url).toContain('/api/v1/s/token');
    });
});

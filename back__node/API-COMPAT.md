# API-COMPAT — Front <-> back__node

## Base URL

- Front: `VITE_API_BASE_URL + /v1`
- API Node expose: `/api/v1/*`

## JWT

- Header attendu: `Authorization: Bearer <token>`
- Routes protegees retournent `401` si token absent/invalide.

## Mapping des routes

- `POST /api/v1/register` -> `{ user, token, token_type }` (201)
- `POST /api/v1/login` -> `{ user, token, token_type }` (200)
- `POST /api/v1/logout` -> `{ message }` (200)
- `GET /api/v1/user` -> `{ user }` (200)

- `POST /api/v1/files` (multipart) -> `{ id, name, size, mime_type, tags, created_at }` (201)
- `GET /api/v1/files` -> `{ data: FileItem[] }` (200)
- `GET /api/v1/files/:id/download` -> fichier binaire, ou `403 { message, requires_password: true }`
- `POST /api/v1/files/:id/download` -> fichier binaire (password requis)
- `DELETE /api/v1/files/:id` -> `{ message }`

- `POST /api/v1/files/:id/share` -> `{ message, user_id, email }` (201/200)
- `DELETE /api/v1/files/:id/share/:userId` -> `{ message }`
- `POST /api/v1/files/:id/share-link` -> `{ message, url, token, expires_at }` (201)
- `GET /api/v1/s/:token` -> fichier binaire / erreurs explicites `404|410`

## Differences techniques assumees

- IDs Mongo sont des string.
- Le front typant certains IDs en `number`, la compatibilite runtime est conservee car interpolation URL.
- Si necessaire, une couche d'adaptation `legacyNumericId` peut etre ajoutee ulterieurement.

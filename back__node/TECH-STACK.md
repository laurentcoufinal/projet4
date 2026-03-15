# TECH-STACK — back__node

## Runtime et API

- `express`: API REST simple et robuste.
- `helmet`: headers de securite HTTP.
- `cors`: politique cross-origin.
- `morgan`: logging HTTP dev.

## Domaine et validation

- `zod`: validation de payloads d'entree.
- `typescript`: typage strict pour reduire les regressions.

## Securite

- `jsonwebtoken`: JWT Bearer compatible front.
- `bcrypt`: hash des mots de passe compte + fichier.

## Persistance et stockage

- `mongoose`: acces MongoDB via schemas.
- `fs/promises` (Node): stockage local des binaires.

## Upload

- `multer` (memory storage): reception multipart/form-data.

## Qualite et tests

- `vitest`: execution de tests.
- `supertest`: tests d'API HTTP.
- `eslint` + `prettier`: qualite et uniformite de code.

## Pourquoi ce choix

- Stack minimale et connue en production.
- Courbe de maintenance faible.
- Architecture claire et modulaire pour evolutions futures (S3, RBAC, events, etc.).

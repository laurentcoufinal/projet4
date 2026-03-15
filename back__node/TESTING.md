# TESTING — back__node

## Strategie

- Unitaires sur services metier, cas d'usage, DTOs, middleware, validators, storage et security.
- Integration API via `supertest` sur routes critiques.
- Objectif de couverture: >= 70% (seuil Vitest sur les fichiers inclus).

## Couverture

- Commande: `npm run test:coverage`
- Seuil global: 70% (lines, statements, branches, functions).
- Exclus du calcul: `server.ts`, `app.ts`, `env.ts`, `container.ts`, entites/ports (types), `infrastructure/db`, `infrastructure/repositories`, `interfaces/http/types`, pour permettre de viser 70% sans lancer MongoDB ni charger les variables d'environnement en test.

## Scenarios critiques couverts

- Auth: register, login, getCurrentUser, middleware JWT.
- Fichiers: upload, list, download, downloadWithPassword, delete, regles metier (taille, extensions, mot de passe).
- Partage: share, unshare, createShareLink, downloadByToken (lien invalide/expiré).
- Middleware: authenticate, errorHandler, notFoundHandler.
- Validators: validate + schemas.

## Commandes

- `npm test`
- `npm run test:coverage`
- `npm run test:watch`

## A completer

- Tests integraux avec MongoDB en memoire pour flux bout-en-bout reel.
- Tests d'erreurs metier (403/410/422) pour tous endpoints.

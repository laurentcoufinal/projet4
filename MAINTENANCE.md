# Documentation de maintenance — DataShare (projet4)

Ce document décrit les tâches et procédures de maintenance pour l’application DataShare (frontend React + backend Laravel).

---

## 1. Vue d’ensemble

- **Frontend** : [front/](front/) — React 18, Vite, TypeScript.
- **Backend** : [back/](back/) — Laravel, API REST, Sanctum, SQLite par défaut.
- **Documentation** : [README.md](README.md), [docs/architecture.md](docs/architecture.md), [front/architecture.md](front/architecture.md).

---

## 2. Vérifications régulières (qualité et sécurité)

À exécuter en CI ou avant chaque release (voir [README.md — Audit de qualité et de sécurité](README.md#audit-de-qualité-et-de-sécurité)).

### 2.1 Audit de qualité de code

```bash
# Frontend : ESLint + Prettier
cd front && npm run audit:code

# Si format Prettier en échec : appliquer les corrections
cd front && npm run format

# Backend : tests
cd back && php artisan test
```

### 2.2 Audit de sécurité (dépendances)

```bash
# Frontend : vulnérabilités npm
cd front && npm audit

# Corrections sans changement majeur
cd front && npm audit fix

# Backend : vulnérabilités Composer
cd back && composer audit
```

### 2.3 Tests complets

```bash
# Tests unitaires
cd front && npm run test:run
cd back && php artisan test

# Couverture de code (objectif 70 %)
cd front && npm run test:coverage
cd back && php artisan test --coverage   # rapport dans back/coverage/ (pcov ou xdebug requis)

# Tests e2e (backend et front démarrés)
cd front && npm run test:e2e

# Tests de charge (optionnel)
# Voir k6/README.md — ex. docker run ... grafana/k6 run k6/smoke.js
```

---

## 3. Mise à jour des dépendances

### 3.1 Frontend (npm)

```bash
cd front
npm outdated          # voir les paquets obsolètes
npm update            # mises à jour dans les plages autorisées (package.json)
npm install <pkg>@latest   # pour une mise à jour majeure ciblée
npm audit fix         # corriger les vulnérabilités sans breaking
npm audit fix --force # peut introduire des breaking changes
```

Après mise à jour : lancer `npm run audit:code` et `npm run test:run`.

### 3.2 Backend (Composer)

```bash
cd back
composer outdated     # paquets obsolètes
composer update       # mettre à jour selon composer.json
composer update vendor/package   # mise à jour ciblée
composer audit       # vérifier les vulnérabilités après mise à jour
```

Après mise à jour : lancer `php artisan test`.

---

## 4. Base de données

### 4.1 Migrations

```bash
cd back
php artisan migrate           # appliquer les migrations en attente
php artisan migrate:status    # état des migrations
php artisan migrate:rollback  # annuler la dernière migration (si besoin)
```

### 4.2 Sauvegardes (production)

- **SQLite** : copier le fichier de base (ex. `back/database/database.sqlite`) de façon régulière.
- **MySQL/PostgreSQL** : utiliser les outils habituels (`mysqldump`, `pg_dump`) selon la configuration `DB_*` dans `.env`.
- **Fichiers uploadés** : le stockage binaire est configuré via `FILESYSTEM_DISK` et `StorageDaoInterface` ; sauvegarder le disque ou le bucket selon l’environnement.

---

## 5. Configuration et variables d’environnement

### 5.1 Backend (`back/.env`)

- `APP_KEY` : obligatoire (générer avec `php artisan key:generate`).
- `DB_*` : connexion BDD (par défaut SQLite).
- `FILESYSTEM_DISK` : stockage des fichiers (local, s3, etc.).
- En production : `APP_DEBUG=false`, `APP_ENV=production`.

### 5.2 Frontend (`front/.env`)

- `VITE_API_BASE_URL` : URL de l’API (ex. `http://localhost:8000/api`).
- Optionnel pour e2e : `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`.

Ne pas commiter les fichiers `.env` ; s’appuyer sur `.env.example` pour documenter les variables.

---

## 6. Logs et dépannage

### 6.1 Backend

- Logs Laravel : `back/storage/logs/laravel.log` (ou canal configuré dans `config/logging.php`).
- En cas d’erreur 500 : vérifier les logs, `APP_DEBUG` (jamais `true` en prod exposé), permissions `storage/` et `bootstrap/cache/`.

### 6.2 Frontend

- En dev : messages dans la console du navigateur et terminal Vite.
- Build : `npm run build` ; en cas d’erreur, vérifier les imports et la config dans `vite.config.ts`.

### 6.3 Points d’attention

- **Taille max fichier (1 Go)** : côté back `FileController::MAX_FILE_SIZE_MB`, côté front vérification dans `AddFilesModal` / `DropZone` ; en prod vérifier aussi PHP (`upload_max_filesize`, `post_max_size`) et nginx (`client_max_body_size`) si utilisé.
- **Authentification** : token Sanctum ; expiration et sécurisation des cookies/session selon la doc Laravel.
- **Partage par lien** : expiration gérée côté back ; les liens expirés renvoient une erreur (410 ou 404) côté API.

---

## 7. Déploiement

- **Installation from scratch** : voir [README.md — Scripts de déploiement](README.md#scripts-de-déploiement--installation-configuration-bdd).
- **Backend** : `composer install --no-dev`, `php artisan config:cache`, `php artisan route:cache`, `php artisan migrate --force`.
- **Frontend** : `npm ci`, `npm run build` ; servir le contenu de `front/dist/` (nginx, Apache, CDN).
- Ne pas exécuter le serveur de dev Vite (`npm run dev`) en production ; utiliser un serveur web pour les fichiers statiques.

---

## 8. Références

| Document | Usage |
|----------|--------|
| [README.md](README.md) | Démarrage, tests, audits, liens docs |
| [docs/architecture.md](docs/architecture.md) | Architecture globale, flux, données |
| [front/README.md](front/README.md) | Commandes front, tests, e2e |
| [back/README.md](back/README.md) | API, tests, configuration BDD |
| [k6/README.md](k6/README.md) | Tests de charge |

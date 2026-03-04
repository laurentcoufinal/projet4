# DataShare (projet4)

Application de partage de fichiers sécurisé : upload, liste, téléchargement, partage par utilisateur et par lien temporaire.

- **Frontend** : React 18, Vite, TypeScript, React Query, Zustand ([front/](front/))
- **Backend** : Laravel, PHP, Sanctum, API REST ([back/](back/))
- **Taille max par fichier** : 1 Go

## Démarrage rapide

```bash
# Backend (API sur http://localhost:8000)
cd back && php artisan serve

# Frontend (app sur http://localhost:5173)
cd front && npm install && npm run dev
```

Configurer `front/.env` avec `VITE_API_BASE_URL=http://localhost:8000/api`.

## Scripts de déploiement : installation, configuration BDD

- **Backend** : voir [back/README.md](back/README.md) — installation (Composer), configuration BDD (`.env`, migrations), lancement du serveur.
- **Frontend** : voir [front/README.md](front/README.md) — installation (npm), configuration (`.env`), pas de BDD côté front.

Résumé des commandes pour une mise en place from scratch :

```bash
# Backend : installation et configuration BDD
cd back
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend : installation
cd front
npm install
cp .env.example .env
# Renseigner VITE_API_BASE_URL dans front/.env
npm run dev
```

## Documentation

| Document | Description |
|----------|-------------|
| [MAINTENANCE.md](MAINTENANCE.md) | Documentation de maintenance — vérifications, mises à jour, BDD, dépannage |
| [Fonctionnalite.md](Fonctionnalite.md) | Fonctionnalité principale et détail des fonctionnalités avec fichiers de réalisation |
| [docs/architecture.md](docs/architecture.md) | Architecture globale, flux, données, tests |
| [front/README.md](front/README.md) | Front React — commandes, tests unitaires, e2e |
| [front/README-DATASHARE.md](front/README-DATASHARE.md) | Design DataShare, routes, limite 1 Go |
| [front/architecture.md](front/architecture.md) | Architecture détaillée du front |
| [back/README.md](back/README.md) | Backend Laravel — API, tests |
| [k6/README.md](k6/README.md) | Tests de charge k6 (smoke, load, stress) |

## Tests

- **Unitaires (front)** : `cd front && npm run test:run`
- **Unitaires / feature (back)** : `cd back && php artisan test`
- **E2E** : `cd front && npm run test:e2e` (backend démarré)
- **Charge (k6)** : voir [k6/README.md](k6/README.md)

## Audit de qualité et de sécurité

### Audit de qualité de code

| Cible | Commande | Contenu |
|-------|----------|---------|
| **Frontend** | `cd front && npm run audit:code` | ESLint + Prettier (vérification). Corriger le format avec `npm run format` si besoin. |
| **Backend** | `cd back && php artisan test` | Tests unitaires et feature (qualité fonctionnelle). |

### Audit de sécurité (dépendances)

| Cible | Commande | Description |
|-------|----------|-------------|
| **Frontend** | `cd front && npm audit` | Vulnérabilités connues dans les paquets npm. Corrections : `npm audit fix` (sans breaking) ou `npm audit fix --force` (peut casser des versions). |
| **Backend** | `cd back && composer audit` | Vulnérabilités connues dans les paquets Composer. |

À lancer régulièrement (CI ou avant release) pour vérifier la qualité du code et l’absence de failles connues dans les dépendances.

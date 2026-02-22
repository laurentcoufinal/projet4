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

## Documentation

| Document | Description |
|----------|-------------|
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

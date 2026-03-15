# back__node

API Node.js/Express pour DataShare en architecture propre.

## Demarrage

1. Démarrer MongoDB (à la racine du projet) : `docker compose up -d`
2. Copier `.env.example` vers `.env`
3. Installer les dépendances : `npm install`
4. Lancer en dev : `npm run dev`

## Structure

- `src/domain`
- `src/application`
- `src/infrastructure`
- `src/interfaces/http`
- `src/shared`

## Contrat API

Consulter `API-COMPAT.md`.

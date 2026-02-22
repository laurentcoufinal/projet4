# DataShare (front)

Application React de partage de fichiers (design Figma DataShare), connectée à une API Laravel. Taille max par fichier : **1 Go**. Voir `architecture.md` pour la description des fonctionnalités et des fichiers.

## Prérequis

- Node.js (version supportée par le projet)
- Backend Laravel démarré pour l’API (et pour les tests e2e)

```bash
npm install
```

Copier `.env.example` vers `.env` et renseigner `VITE_API_BASE_URL` (ex. `http://localhost:8000/api`). Le backend doit être démarré pour l’API et pour les tests e2e.

---

## Lancer le serveur de développement

```bash
npm run dev
```

L’application est servie sur **http://localhost:5173** (Vite). Pensez à avoir le backend API disponible sur l’URL configurée dans `.env`.

---

## Tests unitaires (Vitest)

Lancer tous les tests unitaires une fois :

```bash
npm run test:run
```

Lancer les tests en mode watch (re-exécution à chaque modification) :

```bash
npm test
```

---

## Tests e2e (Playwright)

Les tests e2e utilisent le **serveur réel** (pas de mocks) : le front doit être servi et l’API backend disponible.

1. Démarrer le backend Laravel (ex. sur `http://localhost:8000`).
2. Optionnel : démarrer le front avec `npm run dev` (Playwright peut aussi le lancer automatiquement).
3. Lancer les tests e2e :

```bash
npm run test:e2e
```

Ouvrir l’interface UI de Playwright (pour déboguer ou rejouer les tests) :

```bash
npm run test:e2e:ui
```

Les tests de connexion utilisent par défaut le compte défini dans `.env.example` (`E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`). Vous pouvez surcharger avec des variables d’environnement :

```bash
E2E_TEST_EMAIL=autre@example.com E2E_TEST_PASSWORD=secret npm run test:e2e
```

---

## Résultats des tests e2e

Les derniers résultats peuvent être enregistrés dans `e2e-results.txt` et `e2e/results/dernier-run.md` (voir section Tests e2e).

---

## Autres commandes

| Commande           | Description                    |
|--------------------|--------------------------------|
| `npm run build`    | Build de production            |
| `npm run preview`  | Prévisualiser le build         |
| `npm run lint`     | ESLint                         |
| `npm run format`   | Prettier (écriture)            |
| `npm run format:check` | Prettier (vérification seule) |
| `npm run audit:code`   | Lint + format:check            |

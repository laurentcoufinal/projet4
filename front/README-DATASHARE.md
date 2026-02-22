# DataShare – Application React (design Figma)

**Toutes les modifications du design Figma DataShare sont faites ici**, dans le dossier **`front/`**.

## Deux applications dans le projet

| Dossier | Techno | URL typique | Design |
|--------|--------|-------------|--------|
| **`projet4/front/`** | React + Vite | **http://localhost:5173** | DataShare (Figma) – fond #0c1222, variables --ds-* |
| **`projet4/back/`** | Laravel + Vite + Blade | http://localhost:8000 | Page d’accueil Laravel (Tailwind, autre style) |

Si vous ouvrez **http://localhost:8000**, vous voyez l’app **Laravel** (back), pas le design DataShare.

## Voir le design DataShare

1. **Lancer le front React** (depuis la racine du projet) :
   ```bash
   cd projet4/front
   npm run dev
   ```
2. **Ouvrir l’URL affichée par Vite** (souvent **http://localhost:5173**) dans le navigateur.
3. Rechargement forcé si besoin : **Ctrl+Shift+R**.

## Port 5173 déjà utilisé

Si au redémarrage vous avez « Port 5173 is in use » ou que le serveur ne libère pas le port :

- **Cause** : l’ancien processus Node/Vite peut encore tourner (terminal fermé sans arrêter le serveur, ou port en TIME_WAIT).
- **Libérer le port** : dans `projet4/front`, exécuter :
  ```bash
  npm run free-port
  ```
  puis relancer `npm run dev`.
- **À la main** (Linux/macOS) : `lsof -ti :5173 | xargs kill -9`

## Routes disponibles (front)

- **/** – Page principale (partage de fichiers, Mes fichiers)
- **/shared/:token** – Page « Fichier partagé » (lien public)

## Fichiers principaux du design

- `src/styles/index.css` – variables `:root` (--ds-bg, --ds-primary, etc.)
- `src/pages/FileSharePage.tsx` + `.module.css`
- `src/pages/SharedFilePage.tsx` + `.module.css`
- `src/components/Header.module.css`, `Footer.module.css`, etc.

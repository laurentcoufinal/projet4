# Architecture de l’application FileShare (front)

## Vue d’ensemble

Application React (Vite + TypeScript) de partage de fichiers, connectée à une API Laravel (Sanctum). Une seule page type landing : en-tête, section « Partager des fichiers », section « Mes fichiers », pied de page. Authentification par token (Zustand persist), données serveur gérées par React Query.

---

## Fonctionnalités principales et fichiers associés

### 1. Point d’entrée et routage

| Fonction | Fichier | Rôle |
|----------|---------|------|
| Point d’entrée React, QueryClient, BrowserRouter | `src/main.tsx` | Montage de l’app, fourniture de React Query et du routeur |
| Définition des routes | `src/App.tsx` | Route `/` → `FileSharePage` |
| Page principale (layout) | `src/pages/FileSharePage.tsx` | Assemble Header, ShareFilesSection, MyFilesSection, Footer |

---

### 2. Authentification (connexion / inscription)

| Fonction | Fichier | Rôle |
|----------|---------|------|
| État auth (token, user, setAuth, logout), persistance | `src/features/auth/auth-store.ts` | Store Zustand persist (localStorage), `useIsAuthenticated()` |
| Appels API login / register / logout / user | `src/api/auth.ts` | `authApi.login`, `authApi.register`, `authApi.logout`, `authApi.getCurrentUser` |
| Client HTTP, Bearer token, déconnexion sur 401 | `src/api/client.ts` | Axios avec intercepteurs (Authorization, suppression 401) |
| Modal Connexion (formulaire, appel login) | `src/features/auth/LoginModal.tsx` | Formulaire email/mot de passe, `authApi.login`, `setAuth`, fermeture |
| Modal Inscription (formulaire, appel register) | `src/features/auth/RegisterModal.tsx` | Formulaire nom/email/mot de passe/confirmation, `authApi.register`, `setAuth` |
| Extraction message d’erreur API (Laravel) | `src/features/auth/api-errors.ts` | `getApiErrorMessage()` pour `errors` / `message` |
| Boutons Connexion / Déconnexion, ouverture modals | `src/components/Header.tsx` | Affiche Connexion ou Déconnexion + nom, ouvre LoginModal/RegisterModal |

---

### 3. En-tête et navigation

| Fonction | Fichier | Rôle |
|----------|---------|------|
| Logo, sous-titre, nav (Upload, Mes fichiers, Connexion/Déconnexion) | `src/components/Header.tsx` | En-tête, scroll vers sections, gestion modals auth |
| Icônes (logo, upload, liste, user) | `src/components/Icons.tsx` | Composants SVG réutilisables |

---

### 4. Upload de fichiers

| Fonction | Fichier | Rôle |
|----------|---------|------|
| Zone glisser-déposer, sélection fichiers, envoi multipart | `src/components/DropZone.tsx` | Drag & drop, input file, `filesApi.upload`, tags optionnels |
| Blocage types MIME dangereux (exécutables, scripts) | `src/components/DropZone.tsx` | Liste `BLOCKED_MIME_PREFIXES`, `isBlockedMime()`, messages rejet |
| Section « Partager des fichiers » (DropZone si connecté) | `src/features/files/ShareFilesSection.tsx` | Titre, DropZone ou invite à se connecter, contrainte 100 Mo |

---

### 5. Liste des fichiers et actions par fichier

| Fonction | Fichier | Rôle |
|----------|---------|------|
| Récupération liste fichiers (React Query) | `src/hooks/useFiles.ts` | `useFiles()`, `filesQueryKey`, appelle `filesApi.list()` |
| Appels API fichiers (list, upload, download, delete, share-link) | `src/api/files.ts` | `filesApi.list`, `upload`, `download`, `delete`, `shareLink`, `share`, `unshare` |
| Section « Mes fichiers » (FileList si connecté) | `src/features/files/MyFilesSection.tsx` | Titre, FileList ou invite à se connecter |
| Stats, filtre par tag, liste (mes fichiers / partagés avec moi) | `src/components/FileList.tsx` | `useFiles()`, séparation owner / partagés, filtre tag, stats |
| Ligne fichier : nom, taille, télécharger, partager, supprimer | `src/components/FileRow.tsx` | Affichage par fichier, `filesApi.download` / `delete`, tooltip partagé |
| Téléchargement (blob, lien temporaire) | `src/components/FileRow.tsx` | `handleDownload` avec `filesApi.download`, création lien `<a>` |
| Suppression avec confirmation | `src/components/FileRow.tsx` | `handleDelete`, `window.confirm`, `filesApi.delete` |

---

### 6. Partage par lien

| Fonction | Fichier | Rôle |
|----------|---------|------|
| Modal partage : génération lien, copie, liens existants | `src/features/files/ShareModal.tsx` | `filesApi.shareLink`, affichage url + date expiration, `share_links` du fichier |
| Ouverture du modal Partager depuis la liste | `src/components/FileList.tsx` | État `shareFile`, bouton Partager → `ShareModal` |

---

### 7. Types et configuration

| Fonction | Fichier | Rôle |
|----------|---------|------|
| Types (User, FileItem, Auth, Share…) | `src/types/index.ts` | Interfaces TypeScript partagées |
| Variables d’environnement (Vite) | `src/vite-env.d.ts` | Déclaration `VITE_API_BASE_URL` |
| Styles globaux, thème, fond | `src/styles/index.css` | Variables CSS, image de fond, classes glass |

---

### 8. Pied de page

| Fonction | Fichier | Rôle |
|----------|---------|------|
| Pied de page (copyright, phrase) | `src/components/Footer.tsx` | Texte FileShare © 2026, style aligné au contenu |

---

## Récapitulatif des fichiers par couche

| Couche | Fichiers |
|--------|----------|
| **API** | `src/api/client.ts`, `src/api/auth.ts`, `src/api/files.ts` |
| **État global** | `src/features/auth/auth-store.ts` |
| **Hooks données** | `src/hooks/useFiles.ts` |
| **Types** | `src/types/index.ts` |
| **Utilitaires** | `src/features/auth/api-errors.ts` |
| **Pages** | `src/pages/FileSharePage.tsx` |
| **Composants UI** | `src/components/Header.tsx`, `Footer.tsx`, `DropZone.tsx`, `FileList.tsx`, `FileRow.tsx`, `Icons.tsx` |
| **Features** | `src/features/auth/LoginModal.tsx`, `RegisterModal.tsx` ; `src/features/files/ShareFilesSection.tsx`, `MyFilesSection.tsx`, `ShareModal.tsx` |
| **Styles** | `src/styles/index.css` ; `*.module.css` à côté de chaque composant |

---

## Flux principaux

1. **Connexion** : Header → Connexion → LoginModal → `authApi.login` → `setAuth` (auth-store) → client.ts envoie Bearer sur les requêtes suivantes.
2. **Upload** : ShareFilesSection (si connecté) → DropZone → sélection/drop → validation taille + MIME → `filesApi.upload` (FormData avec file, name, tags[]) → invalidation cache `['files']`.
3. **Liste fichiers** : MyFilesSection → FileList → `useFiles()` (GET /files) → séparation owner / partagés, filtre par tag → FileRow par fichier.
4. **Téléchargement** : FileRow → `filesApi.download(id)` (blob) → création lien temporaire + click.
5. **Partage** : FileRow Partager → ShareModal → `filesApi.shareLink(id)` → affichage url + expiration, copie dans le presse-papier.

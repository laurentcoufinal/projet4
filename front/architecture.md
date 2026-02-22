# Architecture — DataShare (front)

Documentation d’architecture du frontend, selon la structure recommandée pour les projets informatiques.

---

## 1. Vue d’ensemble

- **Objectif** : Application web de partage de fichiers sécurisé : accueil, gestion « Mes fichiers », upload (limite 1 Go), partage par lien temporaire, téléchargement avec ou sans mot de passe. L’utilisateur s’authentifie puis accède à la liste de ses fichiers, peut en ajouter, créer des liens de partage ou télécharger.
- **Type** : Application web (SPA React), cliente d’une API REST.
- **Stack principale** : React 18, Vite, TypeScript, React Query (TanStack Query), Zustand, Axios, React Router. Tests : Vitest (unitaires), Playwright (e2e). Design : Figma DataShare, variables CSS `--ds-*`, modules CSS.

---

## Utilisation de l’application — parcours utilisateur

Cette section décrit l’usage de DataShare par un **utilisateur final** : les pages, la navigation et les actions possibles à chaque étape.

### Les pages et leur rôle

| Page                | URL              | Rôle                                                                                                                                                                                                                                                                                                       |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accueil**         | `/`              | Présentation de DataShare : titre « Tu veux partager un fichier ? », visuel, lien « Se connecter » en haut à droite. Point d’entrée pour un visiteur.                                                                                                                                                      |
| **Connexion**       | `/connection`    | Formulaire de connexion (email, mot de passe). Lien vers « Créer un compte ». Après connexion → redirection vers « Mes fichiers » (`/partager`).                                                                                                                                                           |
| **Créer un compte** | `/inscription`   | Formulaire d’inscription (email, mot de passe, vérification du mot de passe). Lien vers « J’ai déjà un compte ». Après inscription → redirection vers l’accueil.                                                                                                                                           |
| **Mes fichiers**    | `/partager`      | Liste des fichiers de l’utilisateur (s’il est connecté). Onglets : Tous, Actifs, Expiré. Actions : ajouter des fichiers, pour chaque fichier : accéder (télécharger), partager (créer un lien), supprimer. Si non connecté : message « Connectez-vous pour voir et gérer vos fichiers » et lien Connexion. |
| **Fichier partagé** | `/shared/:token` | Page affichée quand on ouvre un **lien de partage** reçu (ex. par email). Affiche « Fichier partagé » et un bouton « Télécharger le fichier ». Si le lien est expiré ou invalide : message d’erreur et lien « Retour à l’accueil ». Aucune connexion requise.                                              |

### Cheminement type (utilisateur qui dépose et partage)

1. **Arrivée** : L’utilisateur ouvre l’application (accueil `/`).
2. **Connexion** : Il clique sur « Se connecter » → page Connexion. Il saisit email et mot de passe → Connexion → il est redirigé vers **Mes fichiers** (`/partager`).  
   _(S’il n’a pas de compte : « Créer un compte » → page Inscription → après création, il peut aller sur Mes fichiers via le menu ou en saisissant `/partager`.)_
3. **Mes fichiers** : Il voit la liste (vide au début). Il peut :
   - **Ajouter des fichiers** : bouton « Ajouter des fichiers » → fenêtre modale : choix du fichier (max 1 Go), optionnellement mot de passe et durée de validité du lien → « Téléverser » → le fichier est enregistré et un lien de partage peut être créé.
   - **Pour chaque fichier** : **Accéder** (télécharger, avec saisie du mot de passe si le fichier en exige un), **Partager** (créer un lien temporaire, copier l’URL), **Supprimer** (avec confirmation).
   - **Filtrer** : onglets Tous / Actifs / Expiré.
4. **Partager avec quelqu’un** : Depuis « Partager » sur une ligne fichier, il obtient une URL (ex. `.../shared/abc123`). Il envoie ce lien au destinataire (email, messagerie, etc.).
5. **Déconnexion** : Bouton « Déconnexion » (en haut à droite sur Mes fichiers, ou dans le menu sur mobile) → retour à l’accueil, session fermée.

### Cheminement du destinataire d’un lien (sans compte)

1. Il reçoit un lien du type `.../shared/xxxxx`.
2. Il ouvre le lien dans son navigateur → page **Fichier partagé** (`/shared/:token`).
3. Il clique sur « Télécharger le fichier ». Si le lien est encore valide, le téléchargement démarre (éventuellement après saisie d’un mot de passe si le partage en exige un). Aucune connexion ni inscription nécessaire.

### Résumé des fonctions par page

- **Accueil** : voir la présentation, aller vers Connexion.
- **Connexion / Inscription** : créer une session ou un compte, puis accéder à l’application.
- **Mes fichiers** : voir la liste, ajouter des fichiers, télécharger, créer un lien de partage, supprimer un fichier, se déconnecter.
- **Fichier partagé** : télécharger le fichier via le lien reçu (sans se connecter).

---

## 2. Contexte et périmètre

- **Acteurs** : Utilisateur final (navigateur) ; l’API Laravel (backend) est le seul système externe avec lequel le front échange des données (authentification, CRUD fichiers, partage).
- **Frontières** : Dans le périmètre — tout le code dans [front/src/](src/) (pages, composants, features, hooks, client API). Hors périmètre — hébergement, exécution de l’API, base de données, stockage binaire (gérés par le backend).

---

## 3. Architecture logicielle

### Schéma des couches

- **Présentation** : pages et composants UI (routage, formulaires, listes, modals).
- **Features** : découpage par domaine (auth, files, home) — store auth, modals, sections, utilitaires métier.
- **Hooks / données** : `useFiles`, `useMediaQuery` ; orchestration des appels API et état serveur via React Query.
- **API** : client HTTP (Axios), intercepteurs (Bearer, 401), modules `auth` et `files` pour les appels REST.

### Responsabilités par dossier

| Dossier / module                           | Responsabilité                                                                                                                                                                                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [src/api/](src/api/)                       | Client HTTP (client.ts), appels auth (auth.ts) et fichiers (files.ts) ; pas de logique métier UI.                                                                                                                                                                 |
| [src/features/auth/](src/features/auth/)   | Store Zustand (token, user, setAuth, logout), persistance ; modals Login/Register (utilisées sur les pages dédiées) ; extraction des messages d’erreur API.                                                                                                       |
| [src/features/files/](src/features/files/) | Upload (AddFilesModal, DropZone côté ShareFilesSection), liste (MesFileRow, PartagerPage), partage par lien (ShareLinkModal), téléchargement avec mot de passe (DownloadFileModalWithPassword), suppression (DeleteConfirmModal), utilitaires (mesFichiersUtils). |
| [src/features/home/](src/features/home/)   | Hero (titre, bouton circulaire) sur la page d’accueil.                                                                                                                                                                                                            |
| [src/components/](src/components/)         | En-tête, pied de page, DropZone, FileList, FileRow, Icons ; réutilisables, peu de dépendances métier.                                                                                                                                                             |
| [src/hooks/](src/hooks/)                   | useFiles (React Query), useMediaQuery (responsive).                                                                                                                                                                                                               |
| [src/pages/](src/pages/)                   | Point d’entrée par route : FileSharePage (/), PartagerPage (/partager), ConnectionPage (/connection), InscriptionPage (/inscription), SharedFilePage (/shared/:token).                                                                                            |
| [src/types/](src/types/)                   | Interfaces TypeScript partagées (User, FileItem, AuthResponse, etc.).                                                                                                                                                                                             |

### Point d’entrée et routage

| Fonction                      | Fichier                                                                                                                      | Rôle                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Point d’entrée                | [src/main.tsx](src/main.tsx)                                                                                                 | Montage React, QueryClientProvider, BrowserRouter.                                                                                                    |
| Définition des routes         | [src/App.tsx](src/App.tsx)                                                                                                   | `/` → FileSharePage, `/partager` → PartagerPage, `/connection` → ConnectionPage, `/inscription` → InscriptionPage, `/shared/:token` → SharedFilePage. |
| Page d’accueil                | [src/pages/FileSharePage.tsx](src/pages/FileSharePage.tsx)                                                                   | Hero DataShare, Header (variant hero), Footer.                                                                                                        |
| Page Mes fichiers             | [src/pages/PartagerPage.tsx](src/pages/PartagerPage.tsx)                                                                     | Liste (MesFileRow), onglets Tous/Actifs/Expiré, AddFilesModal, ShareLinkModal, DownloadFileModalWithPassword, DeleteConfirmModal.                     |
| Connexion / Inscription       | [src/pages/ConnectionPage.tsx](src/pages/ConnectionPage.tsx), [src/pages/InscriptionPage.tsx](src/pages/InscriptionPage.tsx) | Pages dédiées (non modals) ; formulaire + appel API, redirection après succès.                                                                        |
| Fichier partagé (lien public) | [src/pages/SharedFilePage.tsx](src/pages/SharedFilePage.tsx)                                                                 | Affichage et téléchargement via token (sans auth).                                                                                                    |

### Authentification

| Fonction                                 | Fichier                                                            | Rôle                                                          |
| ---------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| État auth (token, user, setAuth, logout) | [src/features/auth/auth-store.ts](src/features/auth/auth-store.ts) | Store Zustand persist (localStorage), `useIsAuthenticated()`. |
| Appels API auth                          | [src/api/auth.ts](src/api/auth.ts)                                 | login, register, logout, getCurrentUser.                      |
| Client HTTP (Bearer, 401)                | [src/api/client.ts](src/api/client.ts)                             | Axios, intercepteurs Authorization et déconnexion sur 401.    |
| Erreurs API                              | [src/features/auth/api-errors.ts](src/features/auth/api-errors.ts) | `getApiErrorMessage()` pour réponses Laravel.                 |

### Upload et liste des fichiers

| Fonction                                      | Fichier                                                                                                                                                                                                                                        | Rôle                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Liste fichiers (React Query)                  | [src/hooks/useFiles.ts](src/hooks/useFiles.ts)                                                                                                                                                                                                 | `useFiles()`, `filesQueryKey`, GET /files.                                           |
| API fichiers                                  | [src/api/files.ts](src/api/files.ts)                                                                                                                                                                                                           | list, upload, download, downloadWithPassword, delete, shareLink, share, unshare.     |
| Modal d’ajout (1 Go max)                      | [src/features/files/AddFilesModal.tsx](src/features/files/AddFilesModal.tsx)                                                                                                                                                                   | Sélection fichier, mot de passe optionnel, expiration, upload + création de lien.    |
| Zone glisser-déposer                          | [src/components/DropZone.tsx](src/components/DropZone.tsx)                                                                                                                                                                                     | Drag & drop, validation taille (1 Go) et MIME, tags optionnels.                      |
| Section Partager des fichiers                 | [src/features/files/ShareFilesSection.tsx](src/features/files/ShareFilesSection.tsx)                                                                                                                                                           | DropZone si connecté, limite affichée 1 Go.                                          |
| Ligne fichier (page Partager)                 | [src/features/files/MesFileRow.tsx](src/features/files/MesFileRow.tsx)                                                                                                                                                                         | Nom, expiration, actions : accéder, partager (lien), supprimer.                      |
| Modals partage / téléchargement / suppression | [src/features/files/ShareLinkModal.tsx](src/features/files/ShareLinkModal.tsx), [DownloadFileModalWithPassword.tsx](src/features/files/DownloadFileModalWithPassword.tsx), [DeleteConfirmModal.tsx](src/features/files/DeleteConfirmModal.tsx) | Partage par lien, téléchargement (avec/sans mot de passe), confirmation suppression. |

### Styles et configuration

| Fonction                  | Fichier                                      | Rôle                                                                |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| Types partagés            | [src/types/index.ts](src/types/index.ts)     | User, FileItem, ShareLinkItem, LoginCredentials, AuthResponse, etc. |
| Variables d’environnement | [src/vite-env.d.ts](src/vite-env.d.ts)       | Déclaration `VITE_API_BASE_URL`.                                    |
| Styles globaux            | [src/styles/index.css](src/styles/index.css) | Variables CSS, thème, classes utilitaires.                          |
| Styles composants         | `*.module.css` à côté des composants         | Modules CSS scopés.                                                 |

---

## 4. Flux et intégrations

- **Connexion** : Utilisateur sur `/` ou `/partager` → lien « Se connecter » → `/connection` → formulaire → `authApi.login` → `setAuth(token, user)` → redirection vers `/partager`. Les requêtes suivantes envoient `Authorization: Bearer <token>` (intercepteur Axios).
- **Inscription** : Lien « Créer un compte » → `/inscription` → formulaire → `authApi.register` → `setAuth` → redirection vers `/`.
- **Upload (page Partager)** : Clic « Ajouter des fichiers » → AddFilesModal → sélection fichier (max 1 Go) → optionnel mot de passe + expiration → « Téléverser » → `filesApi.upload` + création de lien → refetch liste.
- **Liste fichiers** : PartagerPage → `useFiles()` (GET /api/v1/files) → onglets Tous/Actifs/Expiré → MesFileRow par fichier.
- **Partage par lien** : MesFileRow « Partager » → ShareLinkModal → POST share-link → affichage URL, copie presse-papier.
- **Téléchargement** : MesFileRow « Accéder » → DownloadFileModalWithPassword (avec ou sans mot de passe selon `requires_password`) → GET ou POST download → blob + lien temporaire.
- **Lien public** : `/shared/:token` → SharedFilePage → appel API par token → téléchargement sans auth.

Intégration externe : **API Laravel** uniquement (base URL via `VITE_API_BASE_URL`), pas d’autre service tiers.

---

## 5. Déploiement et exécution

- **Environnements** : Développement local (`npm run dev`, Vite sur http://localhost:5173) ; build de production (`npm run build`).
- **Exécution** : Aucun conteneur ni orchestrateur dans le dépôt ; le front est une SPA servie en statique (ou par un serveur web) et consomme l’API sur l’URL configurée.
- **Variables d’environnement** : `VITE_API_BASE_URL` (ex. `http://localhost:8000/api`). Optionnel pour les tests e2e : `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`.

---

## 6. Décisions et contraintes

- **Choix** : API REST consommée via Axios ; état auth en Zustand avec persistance localStorage ; données serveur (fichiers) via React Query pour cache et refetch ; pages dédiées pour Connexion/Inscription (pas de modals sur la page d’accueil) ; design Figma DataShare (variables CSS, modules CSS).
- **Contraintes** : Taille max fichier **1 Go** (alignée backend ; vérification dans AddFilesModal et DropZone) ; types MIME dangereux bloqués côté client (DropZone) ; partage en lecture seule côté API.
- **Références** : Documentation globale dans [docs/architecture.md](../docs/architecture.md) ; design et routes dans [README-DATASHARE.md](README-DATASHARE.md).

---

## Annexe A — Termes techniques

| Terme                 | Définition courte                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| **API**               | Interface permettant à des logiciels d’échanger des données (REST, GraphQL, etc.).                 |
| **Backend**           | Partie serveur de l’application (logique métier, base de données, APIs).                           |
| **Composant**         | Unité logicielle avec une responsabilité claire, réutilisable.                                     |
| **Couche**            | Niveau logique dans l’architecture (présentation, métier, données).                                |
| **Frontend**          | Partie cliente (navigateur) : UI et interaction utilisateur.                                       |
| **Modèle de données** | Structure des entités et relations (côté front : types TypeScript ; données réelles côté back).    |
| **Persistance**       | Stockage durable des données (côté front : localStorage pour le token ; données métier côté back). |
| **Service**           | Composant exposant une fonctionnalité (ex. client API).                                            |
| **Stack**             | Ensemble des technologies utilisées (langage, framework, BDD, infra).                              |

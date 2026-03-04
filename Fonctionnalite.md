# Fonctionnalités — DataShare (projet4)

Document décrivant l’architecture fonctionnelle de l’application, la fonctionnalité principale et les fonctionnalités détaillées avec les fichiers où elles sont réalisées.

---

## 1. Architecture de l’application

- **Type** : Application web (SPA React + API REST Laravel).
- **Objectif métier** : Partager des fichiers de manière sécurisée (upload, liste, téléchargement, partage entre utilisateurs et par lien temporaire).
- **Stack** : Frontend — React 18, Vite, TypeScript, React Query, Zustand, Axios. Backend — Laravel, Sanctum. Données — SQLite, stockage binaire (DAO).
- **Référence** : [docs/architecture.md](docs/architecture.md).

---

## 2. Fonctionnalité principale

**Partage de fichiers sécurisé**

L’utilisateur authentifié peut déposer des fichiers (max 1 Go), les lister, les télécharger, les protéger par mot de passe (optionnel), les partager avec d’autres utilisateurs (email/user_id) ou via un lien temporaire (token). Le destinataire d’un lien peut télécharger le fichier sans compte. Contraintes : taille max 1 Go, mot de passe fichier min 6 caractères si renseigné, partage en lecture seule.

Cette fonctionnalité est réalisée par l’ensemble des modules listés ci‑dessous (authentification, gestion des fichiers, partage, téléchargement).

---

## 3. Fonctionnalités détaillées et fichiers

### 3.1 Authentification

| Fonctionnalité | Description | Fichiers (réalisation) |
|----------------|-------------|-------------------------|
| **Inscription** | Création de compte (nom, email, mot de passe, confirmation). | **Backend** : [back/app/Http/Controllers/Api/V1/AuthController.php](back/app/Http/Controllers/Api/V1/AuthController.php) (`register`). [back/app/Models/User.php](back/app/Models/User.php). **Frontend** : [front/src/pages/InscriptionPage.tsx](front/src/pages/InscriptionPage.tsx). [front/src/features/auth/RegisterModal.tsx](front/src/features/auth/RegisterModal.tsx). [front/src/api/auth.ts](front/src/api/auth.ts) (`register`). |
| **Connexion** | Connexion par email/mot de passe, réception d’un token Bearer. | **Backend** : [back/app/Http/Controllers/Api/V1/AuthController.php](back/app/Http/Controllers/Api/V1/AuthController.php) (`login`). **Frontend** : [front/src/pages/ConnectionPage.tsx](front/src/pages/ConnectionPage.tsx). [front/src/features/auth/LoginModal.tsx](front/src/features/auth/LoginModal.tsx). [front/src/api/auth.ts](front/src/api/auth.ts) (`login`). |
| **Session / utilisateur courant** | Conservation du token et des infos utilisateur, requête « user » côté API. | **Backend** : [back/app/Http/Controllers/Api/V1/AuthController.php](back/app/Http/Controllers/Api/V1/AuthController.php) (`user`). **Frontend** : [front/src/features/auth/auth-store.ts](front/src/features/auth/auth-store.ts) (Zustand, persistance localStorage). [front/src/api/client.ts](front/src/api/client.ts) (intercepteur Bearer, déconnexion sur 401). [front/src/api/auth.ts](front/src/api/auth.ts) (`getCurrentUser`). |
| **Déconnexion** | Invalidation du token, suppression côté client. | **Backend** : [back/app/Http/Controllers/Api/V1/AuthController.php](back/app/Http/Controllers/Api/V1/AuthController.php) (`logout`). **Frontend** : [front/src/features/auth/auth-store.ts](front/src/features/auth/auth-store.ts) (`logout`). Appel depuis [front/src/pages/PartagerPage.tsx](front/src/pages/PartagerPage.tsx) (bouton Déconnexion). |

---

### 3.2 Gestion des fichiers (CRUD)

| Fonctionnalité | Description | Fichiers (réalisation) |
|----------------|-------------|-------------------------|
| **Liste des fichiers** | Affichage des fichiers de l’utilisateur (propriétaire ou partagés), filtres optionnels (tags, taille), onglets Tous / Actifs / Expiré. | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`index`). [back/app/Models/File.php](back/app/Models/File.php). **Frontend** : [front/src/hooks/useFiles.ts](front/src/hooks/useFiles.ts) (React Query, GET /files). [front/src/pages/PartagerPage.tsx](front/src/pages/PartagerPage.tsx). [front/src/features/files/MesFileRow.tsx](front/src/features/files/MesFileRow.tsx). [front/src/features/files/mesFichiersUtils.ts](front/src/features/files/mesFichiersUtils.ts) (statut expiration). [front/src/api/files.ts](front/src/api/files.ts) (`list`). |
| **Upload (dépôt de fichier)** | Envoi d’un fichier (max 1 Go), optionnel : nom, tags, mot de passe (min 6 caractères). Stockage binaire (clé UUID) + enregistrement en BDD. | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`store`). [back/app/Contracts/StorageDaoInterface.php](back/app/Contracts/StorageDaoInterface.php). Implémentation stockage (ex. disque local). **Frontend** : [front/src/features/files/AddFilesModal.tsx](front/src/features/files/AddFilesModal.tsx). [front/src/features/files/ShareFilesSection.tsx](front/src/features/files/ShareFilesSection.tsx) (DropZone). [front/src/components/DropZone.tsx](front/src/components/DropZone.tsx). [front/src/api/files.ts](front/src/api/files.ts) (`upload`). |
| **Téléchargement (utilisateur connecté)** | Téléchargement d’un fichier par son id ; si le fichier est protégé par mot de passe, appel POST avec le mot de passe. | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`download`, `downloadWithPassword`). **Frontend** : [front/src/features/files/DownloadFileModalWithPassword.tsx](front/src/features/files/DownloadFileModalWithPassword.tsx). [front/src/features/files/MesFileRow.tsx](front/src/features/files/MesFileRow.tsx) (bouton Accéder). [front/src/api/files.ts](front/src/api/files.ts) (`download`, `downloadWithPassword`). |
| **Suppression** | Suppression d’un fichier (réservée au propriétaire). | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`destroy`). **Frontend** : [front/src/features/files/DeleteConfirmModal.tsx](front/src/features/files/DeleteConfirmModal.tsx). [front/src/features/files/MesFileRow.tsx](front/src/features/files/MesFileRow.tsx) (bouton Supprimer). [front/src/pages/PartagerPage.tsx](front/src/pages/PartagerPage.tsx) (mutation delete). [front/src/api/files.ts](front/src/api/files.ts) (`delete`). |

---

### 3.3 Partage

| Fonctionnalité | Description | Fichiers (réalisation) |
|----------------|-------------|-------------------------|
| **Partage par lien temporaire** | Création d’un lien de partage (token, expiration en jours). Retour de l’URL à copier. | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`createShareLink`). [back/app/Models/ShareLink.php](back/app/Models/ShareLink.php). **Frontend** : [front/src/features/files/ShareLinkModal.tsx](front/src/features/files/ShareLinkModal.tsx). [front/src/features/files/MesFileRow.tsx](front/src/features/files/MesFileRow.tsx) (bouton Partager). [front/src/api/files.ts](front/src/api/files.ts) (`shareLink`). |
| **Partage avec un utilisateur** | Partage d’un fichier avec un autre utilisateur (email ou user_id), permission lecture. | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`share`). [back/app/Models/FileShare.php](back/app/Models/FileShare.php). **Frontend** : [front/src/features/files/ShareModal.tsx](front/src/features/files/ShareModal.tsx). [front/src/api/files.ts](front/src/api/files.ts) (`share`). |
| **Révocation d’un partage** | Retrait de l’accès partagé pour un utilisateur donné. | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`unshare`). **Frontend** : [front/src/api/files.ts](front/src/api/files.ts) (`unshare`). |

---

### 3.4 Téléchargement via lien public (sans connexion)

| Fonctionnalité | Description | Fichiers (réalisation) |
|----------------|-------------|-------------------------|
| **Page fichier partagé** | Affichage d’une page dédiée lorsque l’utilisateur ouvre un lien `/shared/:token`. Bouton pour télécharger le fichier (appel direct à l’API par token). | **Backend** : [back/app/Http/Controllers/Api/V1/FileController.php](back/app/Http/Controllers/Api/V1/FileController.php) (`downloadByToken`). Route publique GET `/api/v1/s/{token}`. **Frontend** : [front/src/pages/SharedFilePage.tsx](front/src/pages/SharedFilePage.tsx). Route dans [front/src/App.tsx](front/src/App.tsx) (`/shared/:token`). |

---

### 3.5 Présentation et navigation

| Fonctionnalité | Description | Fichiers (réalisation) |
|----------------|-------------|-------------------------|
| **Page d’accueil** | Présentation de DataShare, titre, visuel, lien « Se connecter ». | **Frontend** : [front/src/pages/FileSharePage.tsx](front/src/pages/FileSharePage.tsx). [front/src/features/home/HeroSection.tsx](front/src/features/home/HeroSection.tsx). [front/src/components/Header.tsx](front/src/components/Header.tsx), [front/src/components/Footer.tsx](front/src/components/Footer.tsx). |
| **Routage** | Routes : `/` (accueil), `/partager` (mes fichiers), `/connection`, `/inscription`, `/shared/:token`. | **Frontend** : [front/src/App.tsx](front/src/App.tsx). [front/src/main.tsx](front/src/main.tsx) (BrowserRouter). |
| **En-tête / navigation** | Logo, liens selon état (connecté / non connecté), boutons Se connecter, Déconnexion, Ajouter des fichiers. | **Frontend** : [front/src/components/Header.tsx](front/src/components/Header.tsx). Utilisé dans les pages. |

---

### 3.6 Données et persistance (backend)

| Élément | Description | Fichiers (réalisation) |
|---------|-------------|-------------------------|
| **Modèles** | User, File, FileShare, ShareLink. | [back/app/Models/User.php](back/app/Models/User.php), [back/app/Models/File.php](back/app/Models/File.php), [back/app/Models/FileShare.php](back/app/Models/FileShare.php), [back/app/Models/ShareLink.php](back/app/Models/ShareLink.php). |
| **Schéma BDD** | Tables users, files, file_share, share_links, personal_access_tokens. | [back/database/migrations/](back/database/migrations/). |
| **MCD (tables)** | Modèle conceptuel de données : entités USER, FILE, FILE_SHARE, SHARE_LINK et associations POSSÈDE, PARTAGÉ AVEC, GÉNÈRE. | [docs/diagrams/mcd-tables.drawio](docs/diagrams/mcd-tables.drawio). |
| **Stockage binaire** | Contrat et implémentation (clé UUID). | [back/app/Contracts/StorageDaoInterface.php](back/app/Contracts/StorageDaoInterface.php). Implémentation(s) (ex. disque) utilisée(s) par `FileController::store` et téléchargements. |

---

## 4. Synthèse des entrées API (backend)

| Méthode | Route | Contrôleur / méthode | Fonctionnalité |
|---------|-------|----------------------|----------------|
| POST | `/api/v1/register` | AuthController::register | Inscription |
| POST | `/api/v1/login` | AuthController::login | Connexion |
| POST | `/api/v1/logout` | AuthController::logout | Déconnexion (auth) |
| GET | `/api/v1/user` | AuthController::user | Utilisateur courant (auth) |
| GET | `/api/v1/s/{token}` | FileController::downloadByToken | Téléchargement lien public |
| POST | `/api/v1/files` | FileController::store | Upload (auth) |
| GET | `/api/v1/files` | FileController::index | Liste fichiers (auth) |
| GET | `/api/v1/files/{id}/download` | FileController::download | Téléchargement (auth) |
| POST | `/api/v1/files/{id}/download` | FileController::downloadWithPassword | Téléchargement avec mot de passe (auth) |
| DELETE | `/api/v1/files/{id}` | FileController::destroy | Suppression (auth) |
| POST | `/api/v1/files/{id}/share` | FileController::share | Partage avec utilisateur (auth) |
| DELETE | `/api/v1/files/{id}/share/{userId}` | FileController::unshare | Révocation partage (auth) |
| POST | `/api/v1/files/{id}/share-link` | FileController::createShareLink | Création lien de partage (auth) |

---

*Document généré à partir de l’analyse de l’architecture (docs/architecture.md, front/architecture.md) et du code du projet.*

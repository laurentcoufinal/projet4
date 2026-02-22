# Architecture — DataShare (projet4)

## 1. Vue d'ensemble

- **Objectif** : Application de partage de fichiers sécurisé : upload, liste, téléchargement, partage par utilisateur (email/user_id) et par lien temporaire (token).
- **Type** : Application web (frontend SPA + API REST).
- **Stack principale** : Frontend — React 18, Vite, TypeScript, React Query, Zustand, Axios. Backend — Laravel 12, PHP 8.2, Laravel Sanctum. Données — SQLite (défaut), stockage fichiers (disque local via `StorageDaoInterface`).
- **contrainte de conception**: stockage deriere une DAO pour facilte la montée en charge si besoin.

---

## Utilisation de l'application — parcours utilisateur

Cette section décrit l'usage de DataShare par un **utilisateur final** : les pages, la navigation et les actions possibles à chaque étape.

### Les pages et leur rôle

| Page | URL | Rôle |
|------|-----|------|
| **Accueil** | `/` | Présentation de DataShare : titre « Tu veux partager un fichier ? », visuel, lien « Se connecter ». Point d'entrée pour un visiteur. |
| **Connexion** | `/connection` | Formulaire de connexion (email, mot de passe). Lien « Créer un compte ». Après connexion → redirection vers « Mes fichiers » (`/partager`). |
| **Créer un compte** | `/inscription` | Formulaire d'inscription (email, mot de passe, vérification). Lien « J'ai déjà un compte ». Après inscription → redirection vers l'accueil. |
| **Mes fichiers** | `/partager` | Liste des fichiers (si connecté). Onglets : Tous, Actifs, Expiré. Actions : ajouter des fichiers ; par fichier : accéder (télécharger), partager (créer un lien), supprimer. Sans connexion : message invitant à se connecter. |
| **Fichier partagé** | `/shared/:token` | Page ouverte via un **lien de partage**. Bouton « Télécharger le fichier ». Si lien expiré/invalide : message d'erreur et « Retour à l'accueil ». Aucune connexion requise. |

### Cheminement type (utilisateur qui dépose et partage)

1. **Arrivée** : Ouverture de l'application (accueil `/`).
2. **Connexion** : « Se connecter » → page Connexion → email + mot de passe → redirection vers **Mes fichiers** (`/partager`). *(Pas de compte : « Créer un compte » → Inscription → puis accès à Mes fichiers.)*
3. **Mes fichiers** : Liste (vide ou non). **Ajouter des fichiers** : choix du fichier (max 1 Go), optionnel mot de passe et durée de validité du lien → téléversement. Par fichier : **Accéder** (télécharger, mot de passe si requis), **Partager** (créer lien, copier l'URL), **Supprimer** (avec confirmation). Filtres : Tous / Actifs / Expiré.
4. **Partager** : Depuis « Partager », copier l'URL du lien et l'envoyer au destinataire.
5. **Déconnexion** : « Déconnexion » → retour à l'accueil.

### Cheminement du destinataire d'un lien (sans compte)

1. Réception d'un lien `.../shared/xxxxx`.
2. Ouverture dans le navigateur → page **Fichier partagé**.
3. « Télécharger le fichier » → téléchargement (éventuellement après mot de passe). Aucune connexion ni inscription.

### Résumé des fonctions par page

- **Accueil** : présentation, accès à Connexion.
- **Connexion / Inscription** : créer une session ou un compte.
- **Mes fichiers** : liste, ajout, téléchargement, création de lien de partage, suppression, déconnexion.
- **Fichier partagé** : téléchargement via le lien reçu (sans connexion).

---

## 2. Contexte et périmètre

- **Acteurs** : Utilisateur final (navigateur) ; accès public en lecture seule pour téléchargement via lien de partage (sans authentification).
- **Frontières** : Dans le projet — frontend ([front/](/front)), API Laravel ([back/](/back)), persistance BDD + stockage binaire. Hors projet — hébergement, SMTP (non utilisé en prod par défaut), éventuels stockages externes (S3) non configurés par défaut.

## 3. Architecture logicielle

- **Schéma de haut niveau** : [Vue système](diagrams/architecture-haut-niveau.drawio). [Composants et couches](diagrams/composants-couches.drawio).
- **Couches / modules** :
  - **Présentation (front)** : [front/src/](/front/src) — pages, composants, features (auth, files), hooks (useFiles), client API (Axios + intercepteurs).
  - **API (back)** : [back/app/Http/Controllers/Api/V1/](/back/app/Http/Controllers/Api/V1) — AuthController, FileController ; routes sous `/api/v1`.
  - **Logique métier / domaine (back)** : Modèles Eloquent ([back/app/Models/](/back/app/Models)), contrat de stockage ([back/app/Contracts/StorageDaoInterface.php](/back/app/Contracts/StorageDaoInterface.php)).
  - **Accès données** : Migrations et modèles Laravel ; implémentation du `StorageDaoInterface` pour le stockage binaire (clé UUID).
- **Responsabilités** :
  - **front/src/api/** : client HTTP, auth et fichiers (appels REST).
  - **front/src/features/auth/** : store Zustand (token, user), modals login/register, gestion erreurs API.
  - **front/src/features/files/** : sections partage (upload) et « Mes fichiers », modal partage par lien.
  - **back/ FileController** : CRUD fichiers, partage utilisateur, lien de partage, téléchargement par token.
  - **back/ AuthController** : register, login, logout, user (Sanctum).

## 4. Flux et intégrations

- **Flux principaux** :
  - **Authentification** : Connexion / Inscription → POST `/api/v1/login` ou `register` → token Bearer stocké (Zustand + localStorage) ; requêtes suivantes avec header `Authorization: Bearer <token>`. Déconnexion → POST `logout`, suppression token.
  - **Upload** : POST `/api/v1/files` (multipart : file, name, tags[]) → stockage binaire (clé UUID) + enregistrement en BDD (File) → réponse JSON (id, name, size, mime_type, tags, created_at).
  - **Liste fichiers** : GET `/api/v1/files` (filtres optionnels : tags[], size_min, size_max) → fichiers dont l'utilisateur est propriétaire ou partagé ; chargement côté front via React Query.
  - **Téléchargement** : GET `/api/v1/files/{id}/download` (auth) ou GET `/api/v1/s/{token}` (sans auth) → stream binaire.
  - **Partage** : POST `files/{id}/share` (user_id ou email) → création FileShare (permission read) ; POST `files/{id}/share-link` (expires_in_days) → création ShareLink, retour url + token.
- **Intégrations externes** : Aucune API tierce obligatoire. Stockage fichier configurable (FILESYSTEM_DISK, implémentation StorageDaoInterface). Optionnel : Redis, S3 (variables d'environnement présentes dans .env.example).

## 5. Données et persistance

- **Modèle de données** :
  - **users** : id, name, email, email_verified_at, password, remember_token, timestamps.
  - **files** : id, user_id (FK users), name, storage_key (unique), size, mime_type, tags (JSON), timestamps.
  - **file_share** : file_id (FK files), user_id (FK users), permission (ex. read).
  - **share_links** : file_id (FK files), token, expires_at.
  - **personal_access_tokens** (Sanctum) : gestion des tokens d'API.
- **Technologies** : SQLite par défaut (DB_CONNECTION=sqlite) ; stockage binaire via disque local (FILESYSTEM_DISK=local), clé = UUID (pas de nom de fichier dans le chemin).
- **Migrations** : [back/database/migrations/](/back/database/migrations) — versioning du schéma ; pas de stratégie de migration documentée autre que `php artisan migrate`.

## 6. Domain-Driven Design

Le projet s’appuie sur un domaine « partage de fichiers » sans formaliser des Bounded Contexts DDD. Les éléments ci‑dessous décrivent le vocabulaire et les structures issus du code.

- **Contexte délimité(s)** : Un seul contexte métier principal — **Partage de fichiers** (upload, liste, téléchargement, partage entre utilisateurs, partage par lien). Sous‑domaine **Authentification** (inscription, connexion, token) en support.
- **Sous-domaines** : Partage de fichiers — core (in-house). Authentification — support (Laravel Sanctum).
- **Agrégats** : **File** (racine) : invariant « un fichier appartient à un user » ; **ShareLink** et **FileShare** dépendent de File. **User** : agrégat racine pour l’auth.

- **Champs (modèles)** : extraits des modèles Eloquent.

- **Événements de domaine** : Aucun événement de domaine explicite (pas de bus d’événements métier).
- **Intégration entre contextes** : Authentification exposée via API (login, register, token) ; le contexte « fichiers » consomme l’utilisateur authentifié (auth:sanctum). Pas de couche anti-corruption formalisée.

## 7. Déploiement et exécution

- **Environnements** : Développement local (php artisan serve, npm run dev) ; staging/prod non documentés dans le dépôt.
- **Exécution** : Backend — `php artisan serve` (port 8000). Frontend — `npm run dev` (Vite) ou build statique (`npm run build` + hébergement des assets). Pas de conteneur Docker ni d’orchestrateur dans le dépôt.
- **Variables d’environnement** :
  - **Backend** ([back/.env.example](/back/.env.example)) : APP_NAME, APP_ENV, APP_KEY, APP_DEBUG, APP_URL, DB_*, SESSION_DRIVER, FILESYSTEM_DISK, CACHE_STORE, LOG_*, etc. (pas de valeurs sensibles dans le doc).
  - **Frontend** ([front/.env.example](/front/.env.example)) : VITE_API_BASE_URL (ex. `http://localhost:8000/api`). Optionnel E2E : E2E_TEST_EMAIL, E2E_TEST_PASSWORD.

## 7b. Tests

- **Tests unitaires (front)** : Vitest — `npm run test:run` dans `front/` (composants, hooks, modals, limite 1 Go).
- **Tests unitaires / feature (back)** : PHPUnit — `php artisan test` dans `back/` (auth, fichiers, upload, partage, limite 1 Go).
- **Tests e2e** : Playwright — `npm run test:e2e` dans `front/` ; le backend doit être démarré. Résultats : `front/e2e-results.txt`, `front/e2e/results/dernier-run.md`.
- **Tests de charge** : k6 (Grafana) — scripts dans `k6/` (smoke, load, stress). Voir `k6/README.md`. Lancer avec Docker : `docker run --rm -v "$(pwd)":/app -w /app --network host grafana/k6 run k6/smoke.js`.

## 8. Décisions et contraintes

- **Choix** : API REST versionnée (`/api/v1`) ; authentification par token (Sanctum) pour le front SPA ; stockage binaire découplé via interface (`StorageDaoInterface`) pour permettre un changement de support (local, S3) sans toucher aux contrôleurs.
- **Contraintes** : Taille fichier max **1 Go** (FileController::MAX_FILE_SIZE_MB = 1024) ; types MIME dangereux bloqués côté front (DropZone) ; partage en lecture seule (permission `read`).
- **Références** : Cahier des charges mentionné dans [back/README.md](/back/README.md) (cahier_des_charges_application_partage_fichiers.md).

---

## Annexe A — Termes techniques

| Terme | Définition courte |
|-------|-------------------|
| **API** | Interface permettant à des logiciels d'échanger des données (REST, GraphQL, etc.). |
| **Backend** | Partie serveur de l'application (logique métier, base de données, APIs). |
| **Cache** | Stockage temporaire pour accélérer les accès (ex. Redis, mémoire). |
| **Composant** | Unité logicielle avec une responsabilité claire, réutilisable. |
| **Couche** | Niveau logique dans l'architecture (présentation, métier, données). |
| **Frontend** | Partie cliente (navigateur) : UI et interaction utilisateur. |
| **Modèle de données** | Structure des entités et relations (tables, schéma). |
| **Persistance** | Stockage durable des données (base de données, fichiers). |
| **Service** | Composant exposant une fonctionnalité (souvent via API). |
| **Stack** | Ensemble des technologies utilisées (langage, framework, BDD, infra). |

---

## Annexe B — Termes du Domain-Driven Design

- **Termes métier** et **champs des modèles** : voir les tableaux de la section 6 ; la colonne « Définition » est à remplir par le rédacteur.
- **Termes DDD** utilisés dans le document : **Contexte délimité**, **Sous-domaine**, **Agrégat** — définitions à remplir par le rédacteur ou à reprendre d’une référence DDD.


## Annexe C - recherches preparatoires
# fonctionnalités d'applications existantes :
# Fonctionnalités pour une application de partage de fichiers web

## 1. Fonctionnalités indispensables

### Sécurité
- **Authentification** (login/mot de passe) et idéalement **MFA** (2FA).
- **Contrôle d'accès** : qui peut voir, modifier, partager, supprimer (aligné avec « donner des droits sur des fichiers »).
- **Chiffrement** en transit (HTTPS) et, si possible, au repos.
- **Journal d'audit** : qui a accédé à quoi et quand (utile pour le « partage sécurisé »).

### Fonctionnalités de base
- **Upload / téléchargement** de fichiers (y compris gros fichiers).
- **Reprise d'upload** (chunked upload) pour éviter les échecs sur gros fichiers.
- **Gestion des droits** : lecture seule, modification, partage, suppression.
- **Liens de partage** avec expiration et optionnellement mot de passe.
- **Suppression** (et si possible « corbeille » avant suppression définitive).

### Disponibilité et fiabilité
- **Sauvegarde / résilience** du stockage.
- **Disponibilité** du service (redondance, bon hébergement).

> L’idée de **DAO pour masquer le stockage** (fichier, SQL, NoSQL, CDN) correspond bien à une base solide pour faire évoluer ces fonctionnalités sans tout réécrire.

---

## 2. Fonctionnalités que les utilisateurs demandent souvent

- **Sync multi-appareils** : mêmes fichiers accessibles partout (web + mobile/desktop si vous le faites plus tard).
- **Partage par email** : inviter quelqu’un par adresse email avec un rôle (lecteur / éditeur).
- **Liens avec options** : expiration, mot de passe, nombre de téléchargements max.
- **Prévisualisation** dans le navigateur (PDF, images, vidéos, Office) sans télécharger.
- **Recherche** : par nom, type, date, éventuellement contenu (métadonnées).
- **Organisation** : dossiers, tags, favoris.
- **Collaboration** : commentaires sur les fichiers, notifications (« X vous a partagé un fichier »).
- **Quotas et limites** : espace par utilisateur, taille max par fichier.
- **Révocation** : retirer l’accès à un lien ou à un utilisateur à tout moment.

---

## 3. Fonctionnalités un peu innovantes

### 1) Liens à usage unique ou à « consommation »
Au lieu d’un simple lien avec expiration, le lien est **valide N fois** (ex. 1 téléchargement puis invalidation). Utile pour documents sensibles, contrats, envoi de pièces à un partenaire. Peu de solutions grand public le font de façon simple et visible.

*Côté API Laravel : un token par lien, un compteur de « consommations », invalidation après N accès.*

### 2) Partage « déclaratif » avec preuve
Quand un fichier est partagé, enregistrer une **preuve horodatée** (qui a partagé quoi, à qui, à quelle date, avec quelles options). Idée : traçabilité pour conformité (RGPD, preuves juridiques) ou pour « certifier » qu’un document a bien été remis à une date donnée. À coupler au journal d’audit et au modèle de droits.

*Variante UX : **partage par canal temporaire** (lien ou salle de dépôt) où le destinataire dépose aussi des fichiers dans un espace commun avec expiration, type « salle de rendez-vous » pour échanger des documents sans compte.*

# type de stockges su montée en charge : 

Voici les principales options, avec avantages, inconvénients, extensibilité et rapidité.

---

## 1. **Système de fichiers local (disque du serveur)**

**Fonctionnement** : Fichiers écrits sur le disque du serveur (ex. `/uploads/`, `C:\data\files\`).

| **Avantages** | **Inconvénients** |
|---------------|-------------------|
| Simple à mettre en place | Pas adapté au multi-serveurs (pas de partage entre instances) |
| Pas de coût tiers | Pas de haute disponibilité ni de réplication native |
| Accès direct, latence faible | Sauvegardes et restauration à gérer vous-même |
| Pas de limite de débit externe | Risque de saturation du disque |

**Extensibilité** : Faible. Pour scaler il faut un partage (NFS, etc.) ou migrer vers du stockage externe.  
**Rapidité** : Bonne en lecture/écriture locale, mais goulot d’étranglement si tout passe par un seul serveur.

---

## 2. **Stockage objet (S3, Azure Blob, Google Cloud Storage, MinIO, etc.)**

**Fonctionnement** : Fichiers stockés dans des "buckets" / conteneurs, identifiés par une clé (URL ou SDK).

| **Avantages** | **Inconvénients** |
|---------------|-------------------|
| Très scalable (capacité quasi illimitée) | Coût selon volume et bande passante |
| Haute disponibilité et durabilité (réplication) | Latence réseau (API HTTP) |
| Pas de gestion disque côté app | Dépendance à un fournisseur (sauf MinIO self-hosted) |
| URLs pré-signées pour téléchargement direct | Courbe d'apprentissage (SDK, politiques, CORS) |
| Versioning, lifecycle, chiffrement natifs | Pas de "vrai" système de fichiers (clés plates ou hiérarchie simulée) |

**Extensibilité** : Excellente. Conçu pour des pétaoctets et des requêtes parallèles.  
**Rapidité** : Bonne à très bonne (CDN devant possible). Latence supérieure au disque local mais débit élevé.

---

## 3. **Base de données (BLOB dans PostgreSQL, MySQL, etc.)**

**Fonctionnement** : Contenu binaire stocké dans des colonnes BLOB / BYTEA / type binaire.

| **Avantages** | **Inconvénients** |
|---------------|-------------------|
| Tout dans la même base (backup cohérent) | Base très volumineuse, backups lourds |
| Transactions ACID (fichier + métadonnées ensemble) | Performances dégradées avec beaucoup de gros fichiers |
| Pas de serveur de fichiers à gérer | Coût mémoire/cache et I/O disque élevé |
| Contrôle d'accès via la couche métier | Restauration et migration plus lentes |

**Extensibilité** : Limitée. Les grosses bases deviennent lentes et coûteuses à scaler.  
**Rapidité** : Souvent médiocre pour des fichiers de taille importante (streaming, cache, mémoire).

---

## 4. **CDN + stockage objet (CloudFront + S3, Cloudflare R2, etc.)**

**Fonctionnement** : Fichiers dans un stockage objet, servis via un CDN (cache en bord de réseau).

| **Avantages** | **Inconvénients** |
|---------------|-------------------|
| Très rapide pour la lecture (cache proche de l'utilisateur) | Coût CDN + stockage |
| Réduction de charge sur l'origine (S3, etc.) | Invalidation de cache à gérer pour les mises à jour |
| Bonne résilience et répartition géographique | Configuration (en-têtes, TTL, CORS) à maîtriser |

**Extensibilité** : Très bonne (CDN scale naturellement).  
**Rapidité** : Excellente pour le téléchargement (faible latence, haut débit).

---

## 5. **Système de fichiers distribué (NFS, GlusterFS, Ceph, etc.)**

**Fonctionnement** : Un "disque" partagé entre plusieurs serveurs (NAS/SAN ou logiciel distribué).

| **Avantages** | **Inconvénients** |
|---------------|-------------------|
| Même chemin de fichiers sur tous les serveurs | Complexité opérationnelle (cluster, pannes, tuning) |
| Pas de refonte majeure si l'app utilise déjà le filesystem | NFS : point de défaillance, performances variables |
| Ceph/Gluster : réplication et scalabilité possibles | Latence et coût réseau en cluster |

**Extensibilité** : Moyenne à bonne selon la solution (Ceph scale bien).  
**Rapidité** : Variable (réseau, verrouillages). Souvent inférieure au stockage objet + CDN pour du partage web.

---

## 6. **Stockage objet "léger" / self-hosted (MinIO, SeaweedFS, etc.)**

**Fonctionnement** : S3-compatible ou API objet hébergée sur votre infra.

| **Avantages** | **Inconvénients** |
|---------------|-------------------|
| Pas de vendor lock-in, API S3 possible | Vous gérez infra, sauvegardes, HA |
| Coût prévisible (vos serveurs) | Scalabilité manuelle (cluster MinIO, etc.) |
| Données hébergées chez vous si besoin | Moins "illimité" que les clouds publics |

**Extensibilité** : Bonne (cluster MinIO, SeaweedFS).  
**Rapidité** : Bonne en interne ; peut être combiné à un CDN pour la rapidité côté utilisateur.

---

## 7. **Stockage hybride (métadonnées en base + fichiers en objet)**

**Fonctionnement** : Base de données pour noms, tailles, permissions, utilisateurs ; fichiers réels dans S3/MinIO/etc.

| **Avantages** | **Inconvénients** |
|---------------|-------------------|
| Bon compromis : cohérence métier + stockage scalable | Deux systèmes à opérer et à sécuriser |
| Recherche, droits, quotas via la base | Intégration (transactions distribuées) un peu plus complexe |

**Extensibilité** : Très bonne (base pour métadonnées, objet pour volume).  
**Rapidité** : Bonne (lecture/écriture via objet, éventuellement CDN pour la lecture).

---

# Synthèse extensibilité et rapidité

| Solution | Extensibilité | Rapidité (écriture) | Rapidité (lecture) |
|----------|---------------|---------------------|--------------------|
| Disque local | Faible | Bonne | Bonne |
| Stockage objet (S3, etc.) | Très bonne | Bonne | Bonne |
| BLOB en base | Faible | Moyenne | Moyenne à faible |
| CDN + objet | Très bonne | Bonne | Très bonne |
| FS distribué | Moyenne à bonne | Variable | Variable |
| MinIO / SeaweedFS | Bonne | Bonne | Bonne |
| Hybride (BDD + objet) | Très bonne | Bonne | Bonne à très bonne (avec CDN) |

---

## Recommandation pour une app de partage de fichiers web

- **Petit projet / prototype** : disque local ou MinIO self-hosted.
- **Production scalable** : **stockage objet (S3, Azure Blob, R2 ou MinIO) + métadonnées en base** ; ajouter un **CDN** pour les téléchargements fréquents.
- **Contraintes forte souveraineté / coût maîtrisé** : MinIO ou SeaweedFS en cluster, avec CDN optionnel devant.

En résumé : pour l'extensibilité et la rapidité, l'option la plus équilibrée est **objet + (optionnel) CDN**, avec la base de données réservée aux métadonnées et aux droits, pas au contenu binaire.
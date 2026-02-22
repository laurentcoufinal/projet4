g

## 1. Objet et périmètre du projet

### Vision

Projet Laravel (PHP) : création d’une **API** pour le **stockage et le partage sécurisé de fichiers**. L’architecture repose sur une **DAO** (Data Access Object) pour masquer la couche de stockage et permettre d’évoluer facilement entre :

- système de fichiers (disque local),
- base de données SQL (BLOB),
- base NoSQL,
- stockage objet (S3, MinIO, etc.) et CDN.

Les utilisateurs doivent pouvoir **stocker** des fichiers, **donner des droits** sur ces fichiers pour les **partager**, et **supprimer** des fichiers.

### Périmètre phase 1 (MVP)

La **phase 1** vise un **MVP** (Minimum Viable Product) :

- **Stockage** : disque local uniquement.
- **Fonctionnalités** : minimales (auth, upload, téléchargement, droits de base, suppression, partage basique).

L’objectif est de valider le modèle métier et l’architecture (DAO, droits, partage) tout en permettant une évolution ultérieure vers d’autres backends de stockage sans refonte du reste de l’application.

---

## 2. Choix technique phase 1 : stockage local

### Solution retenue

- **Système de fichiers local** : les fichiers sont écrits sur le disque du serveur dans un répertoire dédié (ex. `storage/app/uploads` ou équivalent Laravel).
- Les **métadonnées** (nom, taille, type MIME, propriétaire, droits) restent en **base de données** (MySQL ou PostgreSQL).

### Justification

- Simple à mettre en place, pas de coût tiers, pas de dépendance externe.
- Adapté au prototype et au petit projet.
- Extensibilité limitée en l’état (pas de multi-serveurs sans partage type NFS), mais la **DAO** permettra de remplacer l’implémentation par du stockage objet (S3, MinIO) ou autre sans changer le reste de l’application.

Référence : document projet `type_stockage_application_web_stockage_fichiers` — pour un **petit projet / prototype**, le disque local est recommandé. En production scalable, le même document recommande « métadonnées en base + stockage objet (+ CDN optionnel) », à prévoir comme **évolution**, pas en phase 1.

---

## 3. Fonctionnalités phase 1 (minimales)

### Sécurité (minimal)

- **Authentification** : login / mot de passe (inscription + connexion). Pas de MFA en phase 1.
- **Contrôle d’accès** : distinction entre **propriétaire** du fichier (peut partager et supprimer) et **autres** (droit de lecture si partagé).
- **Chiffrement en transit** : HTTPS exigé en hébergement.

### Fonctionnalités de base (MVP)

- **Upload** de fichiers (taille max à définir, ex. 10–50 Mo ; pas de reprise d’upload / chunked upload en phase 1).
- **Téléchargement** des fichiers auxquels l’utilisateur a droit (propriétaire ou partagé en lecture).
- **Gestion des droits** : au minimum **lecture** et **propriétaire** (qui peut partager et supprimer).
- **Suppression** de fichier par le propriétaire uniquement.
- **Partage minimal** : attribution d’un **droit de lecture** à un autre utilisateur identifié (par identifiant ou email). Optionnel en phase 1 : lien de partage simple avec **expiration**.

### Hors scope phase 1 (évolutions)

À traiter ultérieurement : MFA, journal d’audit détaillé, reprise d’upload (chunked), corbeille, liens à mot de passe, prévisualisation (PDF, images, etc.), recherche avancée, quotas par utilisateur, partage par lien avec options avancées. Référence : `fonctionnalite_stockage_web_fichiers.md`.

---

## 4. Modèle de données / métadonnées (phase 1)

- Les **métadonnées** (nom fichier, taille, type MIME, propriétaire, date de création, droits, tags) sont stockées en **base de données** (MySQL/PostgreSQL avec Laravel).
- Les **fichiers** (contenu binaire) sont stockés sur le **disque local** via la DAO sous un **nom anonyme** (clé unique, ex. UUID). Seule la BDD fait le lien entre le fichier métier (nom, utilisateur, partage) et le stockage physique.

### Nom en BDD vs stockage anonyme

- **En BDD** : le champ **`name`** contient le nom du fichier tel que l’utilisateur l’a enregistré (affiché partout, utilisé pour la recherche et la gestion). Le champ **`storage_key`** contient la clé anonyme utilisée par la DAO pour lire/écrire le binaire (c’est le seul lien BDD ↔ disque).
- **Sur le disque** : le fichier est enregistré uniquement sous cette clé (aucun nom d’utilisateur ni nom de fichier réel dans le chemin). Lors d’un téléchargement, l’API renvoie le flux via la DAO avec `storage_key` et le nom d’affichement vient de `files.name` (ex. header `Content-Disposition`).

Cela améliore la **sécurité** (pas d’information sensible sur le disque), facilite la **gestion** et la **recherche** (tout en BDD).

### Entités minimales

- **User** : authentification (email, mot de passe hashé, etc.).
- **File** : métadonnées (name, storage_key, user_id, **size**, mime_type, **tags**) ; `storage_key` est la référence utilisée par la DAO pour accéder au binaire. La **taille** (size, en octets) et les **tags** (liste libre) permettent la recherche et le filtrage (ex. par plage de taille, par tag).
- **FileShare** (table `file_share`) : qui a quel droit sur quel fichier (file_id, user_id, permission ex. « read »). Le propriétaire est déduit de `files.user_id`.
- **ShareLink** : token, expires_at, file_id, pour le partage par lien avec expiration.

---

## 5. API (contours phase 1)

### Format

- **REST**, réponses en **JSON**.
- **Authentification** : token (Laravel Sanctum ou équivalent) ; endpoints protégés sauf inscription / login.

### Endpoints minimaux

- **Inscription** (création de compte).
- **Login** (obtention du token).
- **Upload** : envoi d’un fichier ; création des métadonnées (nom, taille, type MIME, tags optionnels) et écriture du binaire via la DAO.
- **Liste des fichiers** : fichiers dont l’utilisateur est propriétaire + fichiers partagés avec lui (avec indication des droits). Filtrage possible par **taille** (min/max en octets) et par **tags** pour la recherche.
- **Téléchargement** : accès au fichier (stream ou téléchargement) avec contrôle du droit (propriétaire ou partagé en lecture).
- **Suppression** : réservée au propriétaire ; suppression des métadonnées et du fichier physique via la DAO.
- **Partage** : attribution d’un droit de lecture à un utilisateur (par identifiant ou email). Optionnel : **création / révocation de lien de partage** (token + expiration).

---

## 6. Évolutions prévues (hors phase 1)

- **Stockage** : remplacer l’implémentation « disque local » de la DAO par **stockage objet** (S3, MinIO, Azure Blob, etc.) ou **BLOB en base**, sans changer le reste de l’application (contrats de la DAO inchangés).
- **Fonctionnalités** : ajout des fonctionnalités listées dans `fonctionnalite_stockage_web_fichiers.md` (journal d’audit, MFA, reprise d’upload, corbeille, liens avec mot de passe et options, prévisualisation, recherche, quotas, etc.).
- **Production scalable** : métadonnées en base + stockage objet + CDN optionnel pour les téléchargements (cf. `type_stockage_application_web_stockage_fichiers`).

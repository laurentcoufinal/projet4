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

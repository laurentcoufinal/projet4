# Cahier des charges – Front FileShare (partage de fichiers web)

## Contexte

- **Backend** : API Laravel (Sanctum), préfixe `v1`. Endpoints décrits dans `api_service_rest.md`.
- **Maquette** : [Figma – FileShare (node 3-3)](https://www.figma.com/design/kCshb2yahIPeU2SINCkqfG/Sans-titre?node-id=3-3&m=dev).

---

## Stack technique

- **Build** : Vite
- **Framework** : React avec TypeScript
- **Routing** : React Router
- **State management** :
  - **Zustand** : état d’authentification (token, user, login/register/logout)
  - **React Query (TanStack Query)** : données serveur (liste des fichiers, mutations upload/suppression/partage)
- **HTTP** : client Axios avec intercepteur `Authorization: Bearer <token>` et base URL configurable
- **Environnement** : variable `VITE_API_BASE_URL` (ex. `http://localhost:8000/api`), voir `.env.example`

---

## Interface

- **Page unique** type landing FileShare, alignée sur la maquette Figma :
  - **En-tête** : logo FileShare, sous-titre « Partagez vos fichiers facilement », boutons **Upload**, **Mes fichiers**, **Connexion** (ou **Déconnexion** + nom d’utilisateur si connecté).
  - **Section « Partager des fichiers »** : zone de glisser-déposer + « ou cliquez pour sélectionner des fichiers », avec indication des contraintes (formats : tous, taille max : 100 Mo par fichier). Visible et utilisable uniquement si l’utilisateur est connecté.
  - **Section « Mes fichiers »** : statistiques (X fichiers enregistrés, Y fichiers partagés), liste des fichiers avec actions : télécharger, partager, supprimer (avec confirmation). Visible uniquement si connecté.
  - **Pied de page** : « FileShare © 2026 - Partagez vos fichiers en toute sécurité ».

- **Authentification** : modals **Connexion** et **Inscription**, ouverts depuis le bouton « Connexion ». Appels `POST /v1/login` et `POST /v1/register`. Après succès, fermeture du modal et mise à jour du store Zustand (token + user). Lien « S’inscrire » / « Se connecter » pour basculer entre les deux modals.

---

## Fonctionnalités

1. **Inscription / Connexion** : modals, appels API, persistance du token (Zustand persist).
2. **Upload** : glisser-déposer ou clic pour sélectionner, envoi `POST /v1/files` (multipart), limite affichée 100 Mo par fichier.
3. **Liste des fichiers** : `GET /v1/files` via React Query, affichage dans la section « Mes fichiers » avec statistiques.
4. **Téléchargement** : `GET /v1/files/{id}/download`, déclenchement du téléchargement côté navigateur.
5. **Suppression** : `DELETE /v1/files/{id}` avec confirmation utilisateur, puis invalidation du cache React Query.
6. **Partage par lien** : action « Partager » sur un fichier ouvre un modal affichant un lien de partage (généré par l’API si disponible, sinon lien construit côté front `{origin}/shared/{fileId}`). Bouton « Copier le lien ». Option « Générer un lien de partage (API) » pour appeler `POST /v1/files/{id}/share` avec `{ share_link: true }` si l’API le supporte.

---

## Contraintes affichées

- Formats supportés : tous types de fichiers.
- Taille max : 100 Mo par fichier.

---

## Hypothèses et points à confirmer

- **Partage** : partage par lien. Le format exact de la réponse de `POST /v1/files/{id}/share` (champ `share_link` ou équivalent) est à aligner avec l’API Laravel. En l’absence de lien renvoyé par l’API, le front affiche et permet de copier un lien de la forme `{origin}/shared/{fileId}`.
- **Réponses API** : le front suppose des réponses JSON avec structure `{ data: ... }` pour listes et ressources ; les réponses d’auth avec `{ token, user }`.

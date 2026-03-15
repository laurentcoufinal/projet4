# Architecture — back__node

## Vue d'ensemble

`back__node` est une API REST Node.js/Express pour DataShare, structurée en Clean Architecture afin de rendre le code lisible, testable et facile a faire evoluer.

## Regles d'architecture

- Les couches sont strictes: `interfaces` -> `application` -> `domain`.
- `domain` ne depend d'aucune techno externe (Express, Mongo, JWT, etc.).
- `application` orchestre les cas d'usage via des ports (`domain/ports`).
- `infrastructure` implemente les ports (MongoDB, stockage local, bcrypt, JWT).
- La couche HTTP mappe explicitement DTO HTTP <-> DTO applicatifs.
- Les erreurs metier sont explicites (`AppError`) et converties en statuts HTTP.

## Arborescence

- `src/domain`: entites (`User`, `File`, `Tag`, `ShareLink`, `FileShare`) et ports.
- `src/application`: cas d'usage (auth, fichiers, partage) + DTO.
- `src/infrastructure`: Mongoose repositories, stockage local, security providers.
- `src/interfaces/http`: routes, middleware, validateurs.
- `src/shared`: config, constantes metier, erreurs.

## Regles metier figees (DDD applique)

- `Tag` est une entite (identite + unicite par fichier).
- `FileSize <= 1 Go` est une policy applicative constante.
- `ForbiddenExtensionPolicy` est une policy applicative constante.
- Mot de passe fichier (optionnel) hashé, min 6 caracteres.
- Expiration lien configurable de 1 a 7 jours (defaut 7).
- Suppression fichier = metadonnees + binaire.

## Flux principal

1. Route HTTP valide le payload.
2. Route appelle le cas d'usage.
3. Cas d'usage applique les regles metier et appelle les ports.
4. Infrastructure persiste/stocke et retourne les donnees.
5. Reponse HTTP conforme au contrat front.

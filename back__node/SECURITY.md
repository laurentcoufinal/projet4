# SECURITY — back__node

## Mesures en place

- Mots de passe comptes et fichiers hashes via `bcrypt`.
- Auth API par JWT Bearer.
- `helmet` actif sur toutes les routes.
- Validation stricte des entrees (`zod` + regles metier).
- Policy extension interdite: `.exe`, `.bat`, `.cmd`, `.sh`, `.msi`.
- Limite taille fichier: 1 Go.

## Scans recommandes

- `npm audit` a chaque PR.
- Verification dependances critiques JWT / upload / DB.

## Risques residuels

- Aucun mecanisme de revocation JWT distribue (logout stateless).
- Stockage local: a securiser par permissions systeme et backup.
- Pas de rate limiting sur login en l'etat (a ajouter en priorite si exposition publique).

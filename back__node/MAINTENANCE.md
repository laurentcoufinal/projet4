# MAINTENANCE — back__node

## Dependances

- Frequence: revue hebdomadaire mineure, revue mensuelle complete.
- Procedure:
  1. `npm outdated`
  2. Mise a jour incremental par groupe (runtime, puis dev).
  3. `npm test` + smoke API.
  4. `npm audit` + analyse.

## Risques de mise a jour

- `mongoose`: changements de schema/comportement query.
- `jsonwebtoken`: impacts sur verify/sign.
- `multer`: regressions multipart.

## Checklist avant release

- Variables d'environnement valides.
- Dossier upload disponible et droits OS verifies.
- DB indexes crees (email, token, unicites de partage/tags).
- Logs d'erreur surveilles durant 24h apres deploiement.

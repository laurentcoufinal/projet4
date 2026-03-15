# PERF — back__node

## Endpoint critique

- `POST /api/v1/files` (upload + ecriture disque + metadata DB)
- `GET /api/v1/s/:token` (download public)

## Suivi recommande

- Temps de reponse p95/p99 par endpoint.
- Taille moyenne des fichiers.
- Debit download/upload.
- Erreurs 4xx/5xx.

## Outils

- `k6` pour tests de charge ciblant upload/download.
- Logs serveur corrélés au temps de reponse.

## Budget initial

- p95 auth/list: < 200ms en local/staging.
- p95 download metadata/token: < 250ms hors transfert du binaire.
- Monitorer I/O disque pour pics d'upload.

# Tests de charge k6 (Grafana k6)

Scripts de test de charge pour l’API DataShare (backend Laravel).

## Installation de k6

- **Linux (Debian/Ubuntu)** : [Installation officielle](https://grafana.com/docs/k6/latest/set-up/install-k6/)
- **macOS** : `brew install k6`
- **Windows** : télécharger le .msi sur [k6.io](https://k6.io/docs/get-started/installation/)
- **Docker** : `docker run --rm -i grafana/k6 run - < k6/smoke.js`

## Prérequis

Le backend Laravel doit être démarré (ex. `php artisan serve` sur http://127.0.0.1:8000).  
Un utilisateur de test doit exister pour les scénarios login + liste fichiers.

## Scripts

| Fichier    | Description |
|-----------|-------------|
| `smoke.js`  | Test de fumée : 2 VU, 10 s. Vérifie login + liste fichiers. |
| `load.js`   | Test de charge : 10 VU, 30 s (configurable). |
| `stress.js` | Test de stress : montée 5 → 15 → 30 VU puis descente. |

## Lancer les tests

Depuis la racine du projet :

```bash
# Smoke (vérification rapide)
k6 run k6/smoke.js

# Charge (défaut : 10 VU, 30 s)
k6 run k6/load.js

# Charge personnalisée (ex. 20 VU, 1 min)
VUS=20 DURATION=1m k6 run k6/load.js

# Stress (montée en charge)
k6 run k6/stress.js
```

## Variables d’environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `BASE_URL` | `http://127.0.0.1:8000/api/v1` | URL de base de l’API |
| `LOAD_TEST_EMAIL` | `lolo@gmail.com` | Email utilisateur de test |
| `LOAD_TEST_PASSWORD` | `laurent31` | Mot de passe utilisateur de test |
| `VUS` | `10` | Nombre de virtual users (load.js) |
| `DURATION` | `30s` | Durée du test (load.js) |

Exemple avec backend sur un autre host :

```bash
BASE_URL=http://192.168.1.10:8000/api/v1 LOAD_TEST_EMAIL=test@example.com LOAD_TEST_PASSWORD=secret k6 run k6/load.js
```

## Seuils (thresholds)

- **smoke** : &lt; 10 % d’échecs HTTP, p95 &lt; 2 s
- **load** : &lt; 5 % d’échecs, p95 &lt; 3 s, p99 &lt; 5 s
- **stress** : &lt; 10 % d’échecs, p95 &lt; 5 s

Si un seuil n’est pas respecté, k6 quitte avec un code d’erreur (utile en CI).

## Enregistrer les résultats

Sortie complète dans un fichier texte :

```bash
docker run --rm -v "$(pwd)":/app -w /app --network host grafana/k6 run k6/smoke.js 2>&1 | tee k6/results-smoke.txt
```

Les résultats sont aussi résumés dans `k6/results/dernier-run.md` après chaque enregistrement.

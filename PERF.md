# Dernier résultat des tests de charge k6

**Date** : 2026-02-22  
**Script** : smoke.js (2 VU, 10 s)  
**Commande** : `docker run --rm -v "$(pwd)":/app -w /app --network host grafana/k6 run k6/smoke.js`

## Résumé

| Métrique | Valeur |
|----------|--------|
| Itérations | 22 |
| Requêtes HTTP | 44 (4,24/s) |
| Checks réussis | 83,33 % (55/66) |
| Login status 200 | ✓ 100 % |
| List files status 200 | ✗ 50 % (11/11) |
| http_req_failed | 25 % |
| http_req_duration p(95) | 416,77 ms |
| Seuil http_req_failed | ✗ dépassé (rate<0.1) |

Sortie complète : `results-smoke.txt` (à la racine de `k6/`).

## Enregistrer un nouveau run

```bash
cd /home/laurent/projet4
docker run --rm -v "$(pwd)":/app -w /app --network host grafana/k6 run k6/smoke.js 2>&1 | tee k6/results-smoke.txt
# Puis mettre à jour ce fichier (dernier-run.md) avec le résumé.
```

Pour un export JSON (métriques) :  
`k6 run --out json=k6/results/out.json k6/smoke.js`

# Tokens Figma → CSS (à remplir depuis le mode Dev)

Ouvrir chaque node en **mode Dev** (Inspect) et noter les valeurs ci‑dessous, puis les coller dans `src/styles/index.css` dans les variables `:root` correspondantes.

**Liens Figma (mode Dev)** :

- [Frame principal – 9764-12](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-12&m=dev)
- [Header / section partager – 9764-148](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-148&m=dev)
- [Section liste Mes fichiers – 9764-274](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-274&m=dev)
- [Dropzone / cartes – 9764-357](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-357&m=dev)
- [Modales – 9764-506](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-506&m=dev)

---

## Couleurs (Fill / Background)

| Variable CSS         | Node source                | Valeur Figma (hex ou rgba)         |
| -------------------- | -------------------------- | ---------------------------------- |
| `--ds-bg`            | 9764-12                    | #0f172a (à confirmer dans Inspect) |
| `--ds-surface`       | 9764-148                   |                                    |
| `--ds-surface-hover` | 9764-357                   |                                    |
| `--ds-surface-card`  | 9764-357 / 9764-274        |                                    |
| `--ds-primary`       | 9764-148 (boutons)         |                                    |
| `--ds-primary-hover` | 9764-148                   |                                    |
| `--ds-text`          | 9764-12                    |                                    |
| `--ds-text-muted`    | 9764-148 / 9764-274        |                                    |
| `--ds-error`         | 9764-506 (messages erreur) |                                    |
| `--ds-success`       | (optionnel)                |                                    |
| `--ds-border`        | 9764-148 / 9764-274        |                                    |
| `--ds-border-strong` | 9764-357                   |                                    |
| `--ds-glass-bg`      | (si utilisé)               |                                    |

---

## Typo (Text styles)

| Variable CSS         | Node source           | Valeur Figma (ex. Inter 16px Regular) |
| -------------------- | --------------------- | ------------------------------------- |
| `--ds-font-sans`     | 9764-12               |                                       |
| `--ds-title-size`    | 9764-148 / 9764-274   |                                       |
| `--ds-title-weight`  | 9764-148              |                                       |
| `--ds-subtitle-size` | 9764-148              |                                       |
| `--ds-body-size`     | 9764-274 / 9764-506   |                                       |
| `--ds-caption-size`  | 9764-148 (sous-titre) |                                       |

Si la police diffère d’Inter : l’ajouter dans `index.html` (Google Fonts ou fichier local).

---

## Espacements (padding / margin, en rem si possible)

| Variable CSS     | Node source              | Valeur Figma (ex. 16px → 1rem) |
| ---------------- | ------------------------ | ------------------------------ |
| `--ds-space-xs`  | 9764-357 / 9764-506      |                                |
| `--ds-space-sm`  | 9764-148 / 9764-506      |                                |
| `--ds-space-md`  | 9764-148                 |                                |
| `--ds-space-lg`  | 9764-274                 |                                |
| `--ds-space-xl`  | 9764-12 / 9764-148       |                                |
| `--ds-space-2xl` | 9764-12 (entre sections) |                                |

---

## Rayons (corner radius)

| Variable CSS     | Node source                   | Valeur Figma (px) |
| ---------------- | ----------------------------- | ----------------- |
| `--ds-radius-sm` | 9764-148 (boutons) / 9764-506 |                   |
| `--ds-radius-md` | 9764-274 / 9764-506           |                   |
| `--ds-radius-lg` | 9764-357 (dropzone, cartes)   |                   |

---

## Fond de page

- **Image de fond** : si le design en prévoit une, l’exporter depuis Figma, la placer dans `public/` et définir dans `index.css` : `--ds-bg-image: url('/nom-fichier.png');`
- **Sans image** : `--ds-bg-image: none;`

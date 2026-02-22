# Snapshot design – Hero page (Figma 9764-346)

**Lien** : [DataShare – node 9764-346 (mode Dev)](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-346&m=dev)

Les couleurs et styles du hero sont centralisés dans **`src/styles/index.css`** (variables `--hero-*`). Pour aligner au pixel près sur le Figma, ouvrir le node en **mode Dev (Inspect)** et remplacer les valeurs ci‑dessous dans `index.css`.

---

## Variables à coller dans `:root` (index.css)

| Variable                   | Rôle                | Valeur actuelle (à remplacer par Inspect) |
| -------------------------- | ------------------- | ----------------------------------------- |
| `--hero-bg-from`           | Dégradé fond (haut) | `#fef4ec`                                 |
| `--hero-bg-to`             | Dégradé fond (bas)  | `#e89268`                                 |
| `--hero-title-color`       | Couleur titre       | `#1b1b18`                                 |
| `--hero-title-size`        | Taille titre        | `1.25rem`                                 |
| `--hero-title-weight`      | Graisse titre       | `600`                                     |
| `--hero-circle-inner`      | Fill cercle upload  | `#554970`                                 |
| `--hero-circle-ring`       | Anneau du cercle    | `rgba(139, 92, 246, 0.4)`                 |
| `--hero-circle-glow`       | Glow du cercle      | `rgba(167, 139, 250, 0.45)`               |
| `--hero-btn-connect-bg`    | Bouton Se connecter | `#1b1b18`                                 |
| `--hero-btn-connect-hover` | Hover Se connecter  | `#2c2c2c`                                 |
| `--hero-footer-color`      | Copyright           | `#6b7280`                                 |

---

## Où c’est utilisé

- **Hero** : `HeroSection.module.css` (dégradé, titre, cercle) utilise `--hero-*`.
- **Header (hero)** : `Header.module.css` (`.headerHero .logoTitle`, `.navBtnConnect`) utilise `--hero-title-color`, `--hero-btn-connect-bg`, `--hero-btn-connect-hover`.
- **Footer** : `Footer.module.css` utilise `--hero-footer-color`.

Après modification de `index.css`, recharger la page hero (/) pour voir le rendu.

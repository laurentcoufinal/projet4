# Synchronisation Figma → DataShare (frontend)

Design Figma : **DataShare**  
[Figma – DataShare](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare)

## Liens Figma (mode Dev, pour Inspect)

| Node     | Zone                                        | Lien                                                                                                    |
| -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 9764-12  | Frame principal / page                      | [Ouvrir 9764-12](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-12&m=dev)   |
| 9764-346 | Page d'accueil (hero, titre, CTA Connexion) | [Ouvrir 9764-346](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-346&m=dev) |
| 9764-148 | Header / section partager                   | [Ouvrir 9764-148](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-148&m=dev) |
| 9764-274 | Section liste / Mes fichiers                | [Ouvrir 9764-274](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-274&m=dev) |
| 9764-357 | Dropzone / cartes                           | [Ouvrir 9764-357](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-357&m=dev) |
| 9764-506 | Modales (connexion, partage)                | [Ouvrir 9764-506](https://www.figma.com/design/EcJYxMPftd5S3w4JH3xYQw/DataShare?node-id=9764-506&m=dev) |

## Migration des styles (procédure)

1. **Récupérer les tokens** : utiliser le template [docs/figma-tokens.md](figma-tokens.md) pour noter les valeurs depuis le mode Dev (Inspect) pour chaque node.
2. **Coller dans `src/styles/index.css`** : remplacer les valeurs dans `:root` (couleurs, typo, espacements, rayons). Les commentaires dans le fichier indiquent le node Figma source.
3. **Optionnel** : ajuster les modules CSS (Header, Footer, sections, DropZone, FileList, FileRow, AuthModal, ShareModal) si le design impose des écarts ; chaque `*.module.css` référence son node dans le premier commentaire.
4. **Vérification** : cocher la checklist ci-dessous et faire une régression visuelle sur http://localhost:5173/

## Où coller les valeurs Figma

Ouvrir **`src/styles/index.css`** et modifier les variables dans `:root` :

- **Couleurs** (Inspect → Fill / Background) : `--ds-bg`, `--ds-surface`, `--ds-primary`, `--ds-text`, `--ds-text-muted`, `--ds-error`, `--ds-border`, etc.
- **Typo** (Text styles) : `--ds-font-sans`, `--ds-title-size`, `--ds-body-size`, etc.
- **Espacements** (padding / margin dans Figma) : `--ds-space-sm`, `--ds-space-md`, `--ds-space-lg`, etc.
- **Rayons** (corner radius) : `--ds-radius-sm`, `--ds-radius-md`, `--ds-radius-lg`.

Pour une image de fond exportée depuis Figma : placer le fichier dans `public/` (ex. `public/background.png`) et définir dans `index.css` :

```css
--ds-bg-image: url('/background.png');
```

Pour désactiver l'image de fond : `--ds-bg-image: none;`

## Checklist de vérification (après mise à jour des tokens)

- [ ] Frame principal (fond, largeur max, body)
- [ ] Header (logo, titre, sous-titre, boutons)
- [ ] Section « Partager des fichiers » (titre, sous-titre, dropzone, carte « connectez-vous »)
- [ ] Section « Mes fichiers » (titre, stats, filtre, liste, FileRow, boutons)
- [ ] Footer (texte, barre pleine largeur)
- [ ] Modales Connexion / Inscription (champs, boutons, lien S'inscrire / Se connecter)
- [ ] Modale Partager (titre, lien, boutons Copier / Fermer)

**Régression visuelle** : ouvrir http://localhost:5173/, parcourir toutes les zones (non connecté puis connecté), vérifier contraste, lisibilité, alignements.

## Statut de la migration

- **Migration lancée** : 2026-02-21
- **Sauvegarde CSS** : `docs/index.css.before-migration` (valeurs avant migration)
- **Tokens appliqués** : valeurs DataShare (fond #0c1222, primary #2563eb, espacements/rayons unifiés). Pour coller les valeurs exactes du Figma : `docs/figma-tokens.md` puis `src/styles/index.css`.
- Version du fichier Figma : _(à remplir si connue)_

# Comparaison rendu actuel vs design Figma DataShare

## Design demandé (Figma DataShare – 5 nodes)

- **9764-12** – Frame principal : mise en page globale, fond, largeur max.
- **9764-148** – Section header / partager : en-tête avec logo, titre « DataShare », sous-titre, boutons (Upload, Mes fichiers, Connexion).
- **9764-274** – Section liste : « Mes fichiers », stats, liste avec actions (télécharger, partager, supprimer).
- **9764-357** – Composant dropzone / carte : zone glisser-déposer, bordures en pointillés, champs optionnels (tags).
- **9764-506** – Modales : Connexion, Inscription, Partager (lien) – overlay, champs formulaire, boutons.

Pour que le rendu ressemble au design : ouvrir chaque node en **mode Dev** dans Figma, noter couleurs (Fill/Background), typo (font, size, weight), espacements (padding/margin), rayons (corner radius), puis les reporter dans `src/styles/index.css` (variables `--ds-*`) et dans les `.module.css` si besoin.

## Ce que le snapshot va capturer

Après exécution, les logs contiennent :

1. **Textes visibles** : header, main, footer, sections « Partager des fichiers » et « Mes fichiers ».
2. **Styles calculés** : backgroundColor, padding, fontFamily, fontSize, borderRadius pour header, main, section partager, footer.
3. **Variables :root** : --ds-bg, --ds-surface, --ds-primary, --ds-radius-lg.

Comparer ces valeurs avec celles du Figma (Inspect) pour aligner le rendu.

## Correction appliquée (preuve logs)

- **Footer** : Le snapshot montrait un footer en forme de « pill » (padding 4px 8px, borderRadius 8px) à cause de la classe `glass-text`. Il a été aligné sur le header : barre pleine largeur, `background: var(--ds-surface)`, même padding (16px 32px), bordure haute uniquement. Pour un rendu 100 % Figma, copier les couleurs/espacements du node 9764-12 (frame) depuis le mode Dev dans `src/styles/index.css`.

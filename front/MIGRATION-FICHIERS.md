# Fichiers à modifier pour la migration Figma DataShare

Ce document liste tous les fichiers du dossier **front** concernés par la migration des styles vers le design Figma.

## 1. Design system (tokens)

| Fichier                  | Rôle                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **src/styles/index.css** | Variables `:root` (--ds-\*) : coller ici les couleurs, typo, espacements, rayons depuis Figma (mode Dev). |
| **index.html**           | Chargement des polices (Inter ou autre selon Figma).                                                      |

## 2. Page principale

| Fichier                                | Rôle                                              |
| -------------------------------------- | ------------------------------------------------- |
| **src/pages/FileSharePage.module.css** | Layout page, conteneur main (Figma node 9764-12). |

## 3. En-tête et pied de page

| Fichier                              | Rôle                                                     |
| ------------------------------------ | -------------------------------------------------------- |
| **src/components/Header.module.css** | Header, logo, nav, boutons (node 9764-148).              |
| **src/components/Footer.module.css** | Footer, barre pleine largeur (node 9764-12 ou 9764-148). |

## 4. Sections et liste de fichiers

| Fichier                                             | Rôle                                                          |
| --------------------------------------------------- | ------------------------------------------------------------- |
| **src/features/files/ShareFilesSection.module.css** | Section « Partager des fichiers » (node 9764-148 / 9764-357). |
| **src/features/files/MyFilesSection.module.css**    | Section « Mes fichiers » (node 9764-274).                     |
| **src/components/FileList.module.css**              | Liste, stats, filtre par tag (node 9764-274).                 |
| **src/components/FileRow.module.css**               | Ligne fichier, boutons (node 9764-274).                       |

## 5. Upload et modales

| Fichier                                      | Rôle                                             |
| -------------------------------------------- | ------------------------------------------------ |
| **src/components/DropZone.module.css**       | Zone glisser-déposer (node 9764-357).            |
| **src/features/auth/AuthModal.module.css**   | Modales Connexion / Inscription (node 9764-506). |
| **src/features/files/ShareModal.module.css** | Modale partage par lien (node 9764-506).         |

## 6. Icônes

| Fichier                             | Rôle                                         |
| ----------------------------------- | -------------------------------------------- |
| **src/components/Icons.module.css** | Styles des icônes (référence node 9764-148). |

## 7. Documentation (dans front/docs/)

| Fichier                     | Rôle                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| **docs/figma-tokens.md**    | Template pour noter les valeurs Figma avant de les coller dans index.css. |
| **docs/FIGMA-DATASHARE.md** | Liens Figma, procédure de migration, checklist de vérification.           |

## Arborescence rapide

```
front/
├── index.html
├── src/
│   ├── styles/
│   │   └── index.css          ← tokens principaux
│   ├── pages/
│   │   └── FileSharePage.module.css
│   ├── components/
│   │   ├── Header.module.css
│   │   ├── Footer.module.css
│   │   ├── DropZone.module.css
│   │   ├── FileList.module.css
│   │   ├── FileRow.module.css
│   │   └── Icons.module.css
│   └── features/
│       ├── auth/
│       │   └── AuthModal.module.css
│       └── files/
│           ├── ShareFilesSection.module.css
│           ├── MyFilesSection.module.css
│           └── ShareModal.module.css
└── docs/
    ├── figma-tokens.md
    └── FIGMA-DATASHARE.md
```

Pour appliquer le design Figma : ouvrir chaque node en mode Dev dans Figma, noter les valeurs dans **docs/figma-tokens.md**, puis les coller dans **src/styles/index.css**. Ajuster les modules CSS ci-dessus uniquement si le design impose des écarts par zone.

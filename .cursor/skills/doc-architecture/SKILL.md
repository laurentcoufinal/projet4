---
name: doc-architecture
description: Génère une documentation d'architecture claire et structurée pour des projets informatiques. Utiliser quand l'utilisateur demande de documenter l'architecture, de créer ou mettre à jour une doc technique, des diagrammes système, ou une vue d'ensemble du projet.
---

# Documentation d'architecture

Cette skill guide la génération d'une documentation d'architecture de qualité pour un projet informatique.

## Principes

- **Précision** : s'appuyer sur le code et la structure réels du projet, pas sur des suppositions.
- **Hiérarchie** : du contexte métier vers le détail technique.
- **Maintenabilité** : structure reproductible et sections faciles à mettre à jour.
- **Diagrammes** : utiliser draw.io (fichiers `.drawio`), sauf demande explicite d'un autre format.

## Workflow

1. **Explorer le projet** : parcourir la racine, `src/`, configs, dépendances (package.json, requirements.txt, etc.).
2. **Identifier** : type d'app (web, API, mobile, batch), stack, points d'entrée, couches principales.
3. **Structurer** : remplir les sections du template ci‑dessous en ne gardant que celles pertinentes.
4. **Vérifier** : liens internes, noms de dossiers/fichiers et technologies cohérents avec le dépôt.

Pour la rubrique **Domain-Driven Design** (section 6), en plus du reste :
- **Parcourir les contrôleurs** (controllers, handlers, routes) : extraire les termes métier (noms de routes, d'actions, paramètres métier, DTOs, noms de cas d'usage).
- **Parcourir les modèles** (models, entities, schemas) : extraire pour chaque modèle le nom et la liste des champs (attributs, propriétés, colonnes).
- Produire les **listes** (termes métier, champs par modèle) dans le document ; **ne pas remplir les définitions** — laisser la colonne « Définition » vide (à compléter par le rédacteur).

## Template de document

Utiliser cette structure (adapter selon le projet) :

```markdown
# Architecture — [Nom du projet]

## 1. Vue d'ensemble

- **Objectif** : en une ou deux phrases, à quoi sert l'application.
- **Type** : (application web / API / service / librairie / autre).
- **Stack principale** : langages, frameworks, bases de données, infra (ex. Node + React, PostgreSQL, Docker).

## 2. Contexte et périmètre

- Acteurs ou systèmes externes en interaction.
- Frontières du système (ce qui est dans le projet vs hors projet).

## 3. Architecture logicielle

- **Schéma de haut niveau** (diagramme draw.io).
- **Couches ou modules** : présentation, logique métier, accès données, etc.
- **Responsabilités** : qui fait quoi (par dossier ou module).

## 4. Flux et intégrations

- Flux principaux (requête typique, job batch, événement).
- Intégrations externes (APIs, files, messages).
- Diagrammes de séquence ou de flux si utile.

## 5. Données et persistance

- Modèle de données (entités principales, relations).
- Technologies de stockage (SGBD, cache, files).
- Stratégie de migration / versioning si pertinent.

## 6. Domain-Driven Design

À **remplir** lorsque le projet utilise ou s'inspire du DDD.

- **Contexte délimité(s)** : lister les Bounded Contexts du projet et leur rôle (ex. Commande, Catalogue, Facturation). Schéma draw.io des contextes et relations si pertinent.
- **Sous-domaines** : pour chaque contexte, indiquer le type (core, support, générique) et la stratégie (in-house, partagé, tiers).
- **Agrégats** : principaux agrégats par contexte (racine d'agrégat et invariants clés).
- **Termes métier (contrôleurs)** : liste extraite du code (routes, actions, paramètres métier). Tableau : Terme | Définition (laisser vide, à remplir par le rédacteur).
- **Champs (modèles)** : par modèle/entité, liste des champs extraite du code. Tableau : Modèle | Champ | Définition (laisser vide, à remplir par le rédacteur).
- **Événements de domaine** : liste des événements émis ou consommés (pour découplage entre contextes ou avec l'extérieur).
- **Intégration entre contextes** : mode de communication (API, événements, couche anti-corruption) et schéma si besoin.

## 7. Déploiement et exécution

- Environnements (dev, staging, prod).
- Conteneurs, orchestrateur, CI/CD si applicable.
- Variables d'environnement et secrets (sans les valeurs).

## 8. Décisions et contraintes

- Choix d'architecture importants (et pourquoi).
- Contraintes techniques ou organisationnelles.
- Références (ADR, RFC) si elles existent.

## Annexe A — Termes techniques

[Tableau des termes techniques les plus utilisés — voir référence dans la skill.]

## Annexe B — Termes du Domain-Driven Design

À inclure **si le projet utilise ou s'inspire du DDD**.

- **Termes métier** et **champs des modèles** : reprendre les listes de la section 6 (termes issus des contrôleurs, champs issus des modèles). Colonne « Définition » **laissée vide** — à remplir par le rédacteur.
- **Termes DDD** (agrégat, contexte délimité, etc.) : lister uniquement ceux effectivement utilisés dans le document ; définitions à remplir par le rédacteur ou reprendre la référence ci‑dessous.
```

## Quand appliquer cette skill

- Demande de "documentation d'architecture", "doc technique", "vue d'ensemble du projet".
- Demande de diagrammes d'architecture, de flux ou de données.
- Création ou mise à jour d'un README technique / ADR / doc de design.

## Diagrammes draw.io

- **Format** : créer des fichiers `.drawio` (XML draw.io) dans `docs/diagrams/` (ou `docs/architecture/diagrams/`).
- **Dans la doc** : référencer par lien vers le fichier éditable (ex. `[Vue d'ensemble](diagrams/architecture-haut-niveau.drawio)`) ou vers une exportation image (PNG/SVG) si l'utilisateur en génère.
- **Types de diagrammes à produire** :
  - **Vue système** : acteurs, système, dépendances externes (style C4 ou bloc simple).
  - **Composants / modules** : couches (Frontend, Backend, Données) avec flux entre elles.
  - **Séquences** : diagramme de séquence pour un flux typique (acteurs, composants, messages).
  - **Données** : schéma entités/relations ou blocs pour le modèle de données.
- **Contenu des fichiers** : générer le XML draw.io (structure `<mxfile>`) pour que les diagrammes soient versionnables et éditables dans draw.io / VS Code (extension Draw.io Integration).

## Règles de rédaction

- **Terminologie** : un seul terme par concept (ex. toujours "module" ou toujours "composant").
- **Liens** : pointer vers dossiers/fichiers réels (ex. `[services](/src/services)`).
- **Éviter** : contenu générique sans lien avec le repo ; listes de "bonnes pratiques" sans application au projet.
- **Niveau** : une section = un niveau de détail (vue d'ensemble vs détail technique dans des sous-sections).

## Fichiers de sortie

- **Document principal** : proposer un emplacement cohérent (ex. `docs/architecture.md` ou `docs/ARCHITECTURE.md`).
- **Diagrammes** : fichiers `.drawio` dans `docs/diagrams/` (ex. `architecture-haut-niveau.drawio`, `flux-authentification.drawio`).
- **Un seul document principal** par défaut ; découper en plusieurs fichiers (ex. `docs/architecture/overview.md`, `data.md`) si le projet est gros ou si l'utilisateur le demande.

## Annexe — Termes techniques (référence pour le document généré)

À inclure en fin de document d'architecture (Annexe A) si pertinent ; une ligne par terme, définitions concises.

| Terme | Définition courte |
|-------|-------------------|
| **API** | Interface permettant à des logiciels d'échanger des données (REST, GraphQL, etc.). |
| **Backend** | Partie serveur de l'application (logique métier, base de données, APIs). |
| **Cache** | Stockage temporaire pour accélérer les accès (ex. Redis, mémoire). |
| **CI/CD** | Intégration continue (build, tests) et déploiement continu (mise en production automatisée). |
| **Composant** | Unité logicielle avec une responsabilité claire, réutilisable. |
| **Conteneur** | Unité d'exécution isolée (ex. Docker) embarquant app et dépendances. |
| **Couche** | Niveau logique dans l'architecture (présentation, métier, données). |
| **Frontend** | Partie cliente (navigateur, app mobile) : UI et interaction utilisateur. |
| **Microservice** | Service autonome, déployable indépendamment, communiquant par API ou messages. |
| **Modèle de données** | Structure des entités et relations (tables, schéma). |
| **Monolithe** | Application déployée en un seul bloc (à l'opposé des microservices). |
| **Orchestrateur** | Gestion du déploiement et du cycle de vie des conteneurs (ex. Kubernetes). |
| **Persistance** | Stockage durable des données (base de données, fichiers). |
| **Service** | Composant exposant une fonctionnalité (souvent via API). |
| **Stack** | Ensemble des technologies utilisées (langage, framework, BDD, infra). |

## Annexe — Termes du Domain-Driven Design (référence pour le document généré)

À inclure en **Annexe B** du document généré **si le projet utilise ou s'inspire du DDD**.

- **Listes issues du code** (termes métier des contrôleurs, champs des modèles) : les remplir avec les termes/champs extraits ; **ne pas remplir les définitions** — à compléter par le rédacteur.
- **Termes DDD** (concepts) : liste de référence ci‑dessous. Dans le document, n'inclure que les termes effectivement utilisés ; les définitions peuvent être laissées vides (à remplir par le rédacteur) ou reprises de la référence.

| Terme | Définition courte |
|-------|-------------------|
| **Agrégat (Aggregate)** | *(à remplir par le rédacteur)* |
| **Contexte délimité (Bounded Context)** | *(à remplir par le rédacteur)* |
| **Couche anti-corruption (ACL)** | *(à remplir par le rédacteur)* |
| **Domaine** | *(à remplir par le rédacteur)* |
| **Entité (Entity)** | *(à remplir par le rédacteur)* |
| **Événement de domaine (Domain Event)** | *(à remplir par le rédacteur)* |
| **Langage ubiquitaire (Ubiquitous Language)** | *(à remplir par le rédacteur)* |
| **Repository** | *(à remplir par le rédacteur)* |
| **Service applicatif (Application Service)** | *(à remplir par le rédacteur)* |
| **Service domaine (Domain Service)** | *(à remplir par le rédacteur)* |
| **Sous-domaine (Subdomain)** | *(à remplir par le rédacteur)* |
| **Objet valeur (Value Object)** | *(à remplir par le rédacteur)* |

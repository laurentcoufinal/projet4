<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## API de partage de fichiers (DataShare)

Backend Laravel (API REST) pour le stockage et le partage sécurisé de fichiers. Voir le [cahier des charges](cahier_des_charges_application_partage_fichiers.md).

**Base de données** : le projet est configuré par défaut pour **PostgreSQL** (`DB_CONNECTION=pgsql`, Docker dans [docker-compose.yml](docker-compose.yml)). Les tests PHPUnit utilisent **SQLite en mémoire** sauf la suite optionnelle `phpunit.pgsql.xml` / `test:pgsql`.

- **Taille max par fichier** : 1 Go (configurable via `FileController::MAX_FILE_SIZE_MB`). En production, vérifier aussi `upload_max_filesize` et `post_max_size` (PHP) et `client_max_body_size` (nginx si utilisé).

### Scripts de déploiement : installation, configuration BDD

**Installation des dépendances**

```bash
composer install
```

**Base de données (PostgreSQL + Docker)**

Prérequis : [Docker](https://docs.docker.com/get-docker/) / Docker Compose, et l’extension PHP **`pdo_pgsql`** (`php -m | grep pgsql`).

1. Démarrer PostgreSQL : `docker compose up -d` (fichier [docker-compose.yml](docker-compose.yml) : base `laravel`, utilisateur `laravel`, mot de passe d’exemple `secret` — à changer en production).
2. Copier l’environnement : `cp .env.example .env` (les variables `DB_*` sont alignées avec le conteneur).
3. Générer la clé : `php artisan key:generate`
4. Appliquer le schéma : `php artisan config:clear` puis `php artisan migrate`

Arrêter la base : `docker compose down`. Supprimer aussi les données : `docker compose down --volumes`.

Sans Docker, vous pouvez installer PostgreSQL sur la machine et renseigner `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` dans `.env` de la même façon. Pour SQLite en local uniquement, voir les lignes commentées en fin de bloc `DB_*` dans `.env.example`.

**Lancer le serveur**

Après **`php artisan migrate`** (nécessaire notamment pour la table `sessions` si `SESSION_DRIVER=database` dans `.env`).

```bash
php artisan serve
```

L’API est disponible sur `http://localhost:8000` ou `http://127.0.0.1:8000`. Les routes sont préfixées par `/api/v1`.

Si la page affiche une erreur 500 ou « inaccessible » alors que le terminal indique *Server running* : vérifier les migrations (`php artisan migrate`) et les logs (`storage/logs/laravel.log`). Sous **WSL2**, si le navigateur Windows n’atteint pas le serveur, essayez `php artisan serve --host=0.0.0.0 --port=8000` pour écouter sur toutes les interfaces.

### Lancer les tests

**Tous les tests**

```bash
php artisan test
```

**Tests unitaires uniquement** (`tests/Unit`)

```bash
php artisan test --testsuite=Unit
```

**Tests Feature / E2E** (`tests/Feature` — requêtes HTTP, base en mémoire)

```bash
php artisan test --testsuite=Feature
```

**Un fichier ou une classe de test précis**

```bash
php artisan test tests/Unit/FileModelTest.php
php artisan test --filter=AuthTest
```

**Tests d’intégration PostgreSQL** (hors suite par défaut)

Ces tests vérifient migrations, colonnes JSON (`tags`, `whereJsonContains`) et le flux register/login sur une vraie base PostgreSQL.

**Recommandé si PHP sur l’hôte n’a pas `pdo_pgsql`** (souvent la cause des 3 tests *skipped*) : exécuter PHPUnit dans le conteneur **`php_pgsql`** (image avec `pdo_pgsql`, `DB_HOST=postgres`). Au premier usage, construire l’image : `docker compose build php_pgsql`.

```bash
docker compose up -d postgres
php artisan test:pgsql --docker
# ou
composer test:pgsql:docker
```

**Sur l’hôte** (extension `pdo_pgsql` installée, PostgreSQL sur `127.0.0.1:5432`) : la base **`laravel_testing`** est créée au premier init Docker (`docker/postgres/init/`) ; sinon les tests tentent de la créer automatiquement depuis la base `laravel`, ou vous pouvez :  
`docker compose exec postgres psql -U laravel -d laravel -c "CREATE DATABASE laravel_testing OWNER laravel;"`

```bash
php artisan test:pgsql
# ou
composer test:pgsql
# ou
./vendor/bin/phpunit -c phpunit.pgsql.xml
```

Ne pas utiliser `php artisan test --configuration=phpunit.pgsql.xml` : Laravel ajoute déjà `--configuration=phpunit.xml`, ce qui provoque l’erreur *« Option --configuration cannot be used more than once »*.

---

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

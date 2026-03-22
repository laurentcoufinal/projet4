-- Base dédiée aux tests d'intégration PostgreSQL (voir phpunit.pgsql.xml).
-- Exécuté une seule fois à l'initialisation du volume PostgreSQL.
CREATE DATABASE laravel_testing OWNER laravel;

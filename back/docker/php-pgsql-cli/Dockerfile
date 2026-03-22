# PHP CLI avec pdo_pgsql pour exécuter les tests d’intégration PostgreSQL sans installer l’extension sur l’hôte.
FROM php:8.4-cli-bookworm

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libpq-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

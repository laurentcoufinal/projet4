<?php

namespace App\Contracts;

interface StorageDaoInterface
{
    /**
     * Enregistre le contenu sous la clé de stockage donnée.
     *
     * @param  string  $storageKey  Clé anonyme (ex. UUID), seul lien BDD ↔ stockage physique
     * @param  resource|string  $contents  Contenu binaire du fichier
     */
    public function put(string $storageKey, mixed $contents): void;

    /**
     * Retourne le contenu du fichier pour la clé donnée.
     *
     * @return resource|string  Flux ou contenu binaire
     * @throws \RuntimeException si la clé n'existe pas
     */
    public function get(string $storageKey): mixed;

    /**
     * Vérifie si une clé existe.
     */
    public function exists(string $storageKey): bool;

    /**
     * Supprime le fichier physique associé à la clé.
     *
     * @throws \RuntimeException si la clé n'existe pas ou suppression impossible
     */
    public function delete(string $storageKey): void;
}

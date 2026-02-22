<?php

namespace App\DAO;

use App\Contracts\StorageDaoInterface;
use RuntimeException;

class LocalStorageDao implements StorageDaoInterface
{
    public function __construct(
        private readonly string $basePath
    ) {
        if (! is_dir($this->basePath)) {
            mkdir($this->basePath, 0755, true);
        }
    }

    public function put(string $storageKey, mixed $contents): void
    {
        $this->validateKey($storageKey);
        $path = $this->pathFor($storageKey);

        $dir = dirname($path);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        if (is_resource($contents)) {
            $handle = fopen($path, 'w');
            if ($handle === false) {
                throw new RuntimeException("Impossible de créer le fichier: {$path}");
            }
            stream_copy_to_stream($contents, $handle);
            fclose($handle);
        } else {
            if (file_put_contents($path, $contents) === false) {
                throw new RuntimeException("Impossible d'écrire le fichier: {$path}");
            }
        }
    }

    public function get(string $storageKey): mixed
    {
        $this->validateKey($storageKey);
        $path = $this->pathFor($storageKey);

        if (! is_file($path)) {
            throw new RuntimeException("Fichier introuvable pour la clé: {$storageKey}");
        }

        return fopen($path, 'rb');
    }

    public function exists(string $storageKey): bool
    {
        $this->validateKey($storageKey);

        return is_file($this->pathFor($storageKey));
    }

    public function delete(string $storageKey): void
    {
        $this->validateKey($storageKey);
        $path = $this->pathFor($storageKey);

        if (! is_file($path)) {
            throw new RuntimeException("Fichier introuvable pour la clé: {$storageKey}");
        }

        if (! unlink($path)) {
            throw new RuntimeException("Impossible de supprimer le fichier: {$path}");
        }
    }

    private function pathFor(string $storageKey): string
    {
        return $this->basePath . DIRECTORY_SEPARATOR . $storageKey;
    }

    private function validateKey(string $storageKey): void
    {
        if (str_contains($storageKey, '..') || str_contains($storageKey, DIRECTORY_SEPARATOR)) {
            throw new RuntimeException('Clé de stockage invalide.');
        }
    }
}

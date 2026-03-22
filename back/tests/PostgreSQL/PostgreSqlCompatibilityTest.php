<?php

namespace Tests\PostgreSQL;

use App\Models\File;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use PDO;
use PDOException;
use Tests\TestCase;

/**
 * Vérifie migrations, types JSON et requêtes JSON sur PostgreSQL.
 * Sans pdo_pgsql sur l’hôte : `php artisan test:pgsql --docker` (voir README).
 */
class PostgreSqlCompatibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_pgsql')) {
            $this->markTestSkipped(
                'Extension PHP pdo_pgsql absente. Installez-la (ex. paquet php-pgsql) ou lancez : php artisan test:pgsql --docker'
            );
        }

        $this->ensurePostgresTestDatabaseReachable();

        parent::setUp();

        $this->assertSame('pgsql', DB::connection()->getDriverName(), 'La connexion doit utiliser PostgreSQL.');
    }

    /**
     * Vérifie la connexion à la base de test ; tente CREATE DATABASE depuis la base `laravel` si besoin.
     */
    private function ensurePostgresTestDatabaseReachable(): void
    {
        $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '5432';
        $database = $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'laravel_testing';
        $username = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'laravel';
        $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: 'secret';

        $dsn = static fn (string $dbName): string => sprintf('pgsql:host=%s;port=%s;dbname=%s', $host, $port, $dbName);

        $open = static function (string $dbName) use ($dsn, $username, $password): PDO {
            return new PDO($dsn($dbName), $username, $password, [
                PDO::ATTR_TIMEOUT => 5,
            ]);
        };

        try {
            $open($database);

            return;
        } catch (PDOException) {
            // Base absente ou autre erreur : tenter création depuis la base applicative par défaut.
        }

        $fallbackDb = $_ENV['PGSQL_FALLBACK_DATABASE'] ?? getenv('PGSQL_FALLBACK_DATABASE') ?: 'laravel';

        try {
            $admin = $open($fallbackDb);
        } catch (PDOException $e) {
            $this->markTestSkipped(
                'PostgreSQL injoignable. Démarrez Docker (`docker compose up -d`) ou utilisez `php artisan test:pgsql --docker`. '
                .'Détail : '.$e->getMessage()
            );

            return;
        }

        if (! preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
            $this->markTestSkipped('Nom de base de test invalide.');

            return;
        }

        try {
            $admin->exec('CREATE DATABASE '.$database);
        } catch (PDOException $e) {
            if (! str_contains(strtolower($e->getMessage()), 'already exists')) {
                $this->markTestSkipped(
                    'Impossible de créer la base `'.$database.'`. Détail : '.$e->getMessage()
                );

                return;
            }
        }

        try {
            $open($database);
        } catch (PDOException $e) {
            $this->markTestSkipped(
                'Connexion à `'.$database.'` impossible après création. Détail : '.$e->getMessage()
            );
        }
    }

    public function test_migrations_create_expected_tables(): void
    {
        $tables = [
            'users',
            'files',
            'file_share',
            'share_links',
            'cache',
            'jobs',
            'personal_access_tokens',
        ];

        foreach ($tables as $table) {
            $this->assertTrue(
                Schema::hasTable($table),
                "La table « {$table} » doit exister après migration sur PostgreSQL."
            );
        }
    }

    public function test_json_tags_column_round_trip_and_where_json_contains(): void
    {
        $user = User::factory()->create();

        $file = File::query()->create([
            'user_id' => $user->id,
            'name' => 'doc.pdf',
            'storage_key' => (string) Str::uuid(),
            'size' => 1024,
            'mime_type' => 'application/pdf',
            'tags' => ['work', 'draft'],
        ]);

        $file->refresh();
        $this->assertSame(['work', 'draft'], $file->tags);

        $found = File::query()->taggedWith(['draft'])->first();
        $this->assertNotNull($found);
        $this->assertSame($file->id, $found->id);
    }

    public function test_register_and_login_flow(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Pg User',
            'email' => 'pgtest@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'pgtest@example.com');

        $this->assertDatabaseHas('users', ['email' => 'pgtest@example.com']);

        $login = $this->postJson('/api/v1/login', [
            'email' => 'pgtest@example.com',
            'password' => 'password123',
        ]);

        $login->assertStatus(200)->assertJsonStructure(['token', 'user']);
    }
}

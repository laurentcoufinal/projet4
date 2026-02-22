<?php

namespace Tests\Feature;

use App\Contracts\StorageDaoInterface;
use App\Models\File;
use App\Models\ShareLink;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ShareLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_share_link_requires_authentication(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'f.pdf', 10);

        $this->postJson('/api/v1/files/'.$file->id.'/share-link', [])
            ->assertStatus(401);
    }

    public function test_create_share_link_returns_403_for_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $file = $this->createFileForUser($owner, 'f.pdf', 10);

        $response = $this->actingAs($other, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share-link', []);

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'Seul le propriétaire peut créer un lien de partage.']);
        $this->assertDatabaseCount('share_links', 0);
    }

    public function test_create_share_link_creates_link_with_default_expiration_7_days(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'doc.pdf', 10);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share-link', []);

        $response->assertStatus(201)
            ->assertJsonStructure(['url', 'token', 'expires_at'])
            ->assertJsonFragment(['message' => 'Lien de partage créé.']);

        $this->assertDatabaseCount('share_links', 1);
        $link = ShareLink::first();
        $this->assertNotNull($link->expires_at);
        $minExpected = now()->addDays(6)->startOfDay();
        $maxExpected = now()->addDays(8)->endOfDay();
        $this->assertTrue($link->expires_at->between($minExpected, $maxExpected), 'expires_at should be around 7 days from now');

        $response->assertJsonPath('expires_at', $link->expires_at->toIso8601String());
    }

    public function test_create_share_link_accepts_expires_in_days(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'doc.pdf', 10);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share-link', [
                'expires_in_days' => 30,
            ]);

        $response->assertStatus(201);
        $link = ShareLink::first();
        $minExpected = now()->addDays(29)->startOfDay();
        $maxExpected = now()->addDays(31)->endOfDay();
        $this->assertTrue($link->expires_at->between($minExpected, $maxExpected), 'expires_at should be around 30 days from now');
    }

    public function test_create_share_link_validates_expires_in_days_min(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'doc.pdf', 10);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share-link', [
                'expires_in_days' => 0,
            ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('share_links', 0);
    }

    public function test_create_share_link_validates_expires_in_days_max(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'doc.pdf', 10);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share-link', [
                'expires_in_days' => 366,
            ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('share_links', 0);
    }

    public function test_download_by_token_returns_404_for_invalid_token(): void
    {
        $this->getJson('/api/v1/s/invalid-token-xyz')
            ->assertStatus(404)
            ->assertJsonFragment(['message' => 'Lien invalide.']);
    }

    public function test_download_by_token_returns_410_when_link_expired(): void
    {
        $user = User::factory()->create();
        $content = 'secret';
        $file = $this->createFileForUser($user, 'expired.txt', strlen($content), $content);
        $token = Str::random(64);
        ShareLink::create([
            'file_id' => $file->id,
            'token' => $token,
            'expires_at' => Carbon::yesterday(),
        ]);

        $response = $this->getJson('/api/v1/s/'.$token);

        $response->assertStatus(410)
            ->assertJsonFragment(['message' => 'Ce lien a expiré.']);
    }

    public function test_download_by_token_returns_file_when_link_valid(): void
    {
        $user = User::factory()->create();
        $content = 'contenu partagé';
        $file = $this->createFileForUser($user, 'shared.txt', strlen($content), $content);
        $token = Str::random(64);
        ShareLink::create([
            'file_id' => $file->id,
            'token' => $token,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->get('/api/v1/s/'.$token);

        $response->assertStatus(200);
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('shared.txt', $response->headers->get('Content-Disposition'));
        $this->assertSame($content, $response->streamedContent());
    }

    private function createFileForUser(User $user, string $name, int $size, ?string $content = null): File
    {
        $content = $content ?? str_repeat('x', $size);
        $storage = $this->app->make(StorageDaoInterface::class);
        $storageKey = (string) Str::uuid();
        $storage->put($storageKey, $content);

        return File::create([
            'user_id' => $user->id,
            'name' => $name,
            'storage_key' => $storageKey,
            'size' => strlen($content),
            'mime_type' => 'application/octet-stream',
            'tags' => null,
        ]);
    }
}

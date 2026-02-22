<?php

namespace Tests\Feature;

use App\Contracts\StorageDaoInterface;
use App\Models\File;
use App\Models\FileShare;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class FileShareTest extends TestCase
{
    use RefreshDatabase;

    public function test_share_requires_authentication(): void
    {
        $owner = User::factory()->create();
        $file = $this->createFileForUser($owner, 'f.pdf', 10);

        $this->postJson('/api/v1/files/'.$file->id.'/share', ['email' => 'other@example.com'])
            ->assertStatus(401);
    }

    public function test_share_by_email_grants_read_access(): void
    {
        $owner = User::factory()->create();
        $reader = User::factory()->create(['email' => 'reader@example.com']);
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share', ['email' => 'reader@example.com']);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Fichier partagé en lecture.',
                'user_id' => $reader->id,
                'email' => 'reader@example.com',
            ]);

        $this->assertDatabaseHas('file_share', [
            'file_id' => $file->id,
            'user_id' => $reader->id,
            'permission' => 'read',
        ]);
    }

    public function test_share_by_user_id_grants_read_access(): void
    {
        $owner = User::factory()->create();
        $reader = User::factory()->create();
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share', ['user_id' => $reader->id]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('file_share', ['file_id' => $file->id, 'user_id' => $reader->id]);
    }

    public function test_share_returns_403_for_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $reader = User::factory()->create();
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);

        $response = $this->actingAs($other, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share', ['user_id' => $reader->id]);

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'Seul le propriétaire peut partager ce fichier.']);
        $this->assertDatabaseMissing('file_share', ['file_id' => $file->id, 'user_id' => $reader->id]);
    }

    public function test_share_returns_422_when_sharing_with_self(): void
    {
        $owner = User::factory()->create();
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share', ['user_id' => $owner->id]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Vous ne pouvez pas vous partager un fichier à vous-même.']);
    }

    public function test_share_returns_200_when_already_shared(): void
    {
        $owner = User::factory()->create();
        $reader = User::factory()->create();
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);
        FileShare::create(['file_id' => $file->id, 'user_id' => $reader->id, 'permission' => 'read']);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/share', ['user_id' => $reader->id]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Le fichier est déjà partagé avec cet utilisateur.']);
        $this->assertDatabaseCount('file_share', 1);
    }

    public function test_unshare_removes_access(): void
    {
        $owner = User::factory()->create();
        $reader = User::factory()->create();
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);
        FileShare::create(['file_id' => $file->id, 'user_id' => $reader->id, 'permission' => 'read']);

        $response = $this->actingAs($owner, 'sanctum')
            ->deleteJson('/api/v1/files/'.$file->id.'/share/'.$reader->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Partage révoqué.']);
        $this->assertDatabaseMissing('file_share', ['file_id' => $file->id, 'user_id' => $reader->id]);
    }

    public function test_unshare_returns_403_for_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $reader = User::factory()->create();
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);
        FileShare::create(['file_id' => $file->id, 'user_id' => $reader->id, 'permission' => 'read']);

        $response = $this->actingAs($other, 'sanctum')
            ->deleteJson('/api/v1/files/'.$file->id.'/share/'.$reader->id);

        $response->assertStatus(403);
        $this->assertDatabaseHas('file_share', ['file_id' => $file->id, 'user_id' => $reader->id]);
    }

    public function test_unshare_returns_404_when_no_share_exists(): void
    {
        $owner = User::factory()->create();
        $reader = User::factory()->create();
        $file = $this->createFileForUser($owner, 'doc.pdf', 10);

        $response = $this->actingAs($owner, 'sanctum')
            ->deleteJson('/api/v1/files/'.$file->id.'/share/'.$reader->id);

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Aucun partage trouvé pour cet utilisateur.']);
    }

    private function createFileForUser(User $user, string $name, int $size): File
    {
        $content = str_repeat('x', $size);
        $storage = $this->app->make(StorageDaoInterface::class);
        $storageKey = (string) Str::uuid();
        $storage->put($storageKey, $content);

        return File::create([
            'user_id' => $user->id,
            'name' => $name,
            'storage_key' => $storageKey,
            'size' => $size,
            'mime_type' => 'application/octet-stream',
            'tags' => null,
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Contracts\StorageDaoInterface;
use App\Models\File;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class FileDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_delete_requires_authentication(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'x.pdf', 10);

        $this->deleteJson('/api/v1/files/'.$file->id)->assertStatus(401);
    }

    public function test_delete_removes_file_for_owner(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'to-delete.pdf', 50);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/files/'.$file->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Fichier supprimé.']);

        $this->assertDatabaseMissing('files', ['id' => $file->id]);
        $this->assertFalse($this->app->make(StorageDaoInterface::class)->exists($file->storage_key));
    }

    public function test_delete_returns_403_for_non_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $file = $this->createFileForUser($owner, 'not-mine.pdf', 10);

        $response = $this->actingAs($other, 'sanctum')
            ->deleteJson('/api/v1/files/'.$file->id);

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'Seul le propriétaire peut supprimer ce fichier.']);

        $this->assertDatabaseHas('files', ['id' => $file->id]);
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

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class FileUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_upload_requires_authentication(): void
    {
        $file = UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf');

        $response = $this->postJson('/api/v1/files', [
            'file' => $file,
        ]);

        $response->assertStatus(401);
    }

    public function test_upload_creates_file_and_stores_content(): void
    {
        $user = User::factory()->create();
        $content = 'Contenu du fichier test';
        $file = UploadedFile::fake()->createWithContent('rapport.txt', $content);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files', [
                'file' => $file,
                'name' => 'Mon rapport',
                'tags' => ['work', 'draft'],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id', 'name', 'size', 'mime_type', 'tags', 'created_at',
            ])
            ->assertJson([
                'name' => 'Mon rapport',
                'size' => strlen($content),
                'tags' => ['work', 'draft'],
            ]);

        $this->assertDatabaseHas('files', [
            'user_id' => $user->id,
            'name' => 'Mon rapport',
        ]);

        $fileModel = $response->json('id');
        $storageKey = \App\Models\File::find($fileModel)->storage_key;
        $this->assertNotEmpty($storageKey);
    }

    public function test_upload_uses_original_name_when_name_not_provided(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('original-name.pdf', 50, 'application/pdf');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files', ['file' => $file]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'original-name.pdf']);
    }

    public function test_upload_fails_without_file(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /** Limite backend : 1024 Mo (1 Go). Un fichier au-dessus doit être refusé. */
    public function test_upload_fails_when_file_exceeds_max_size(): void
    {
        $user = User::factory()->create();
        $maxSizeKb = 1024 * 1024; // 1 Go en Ko
        $file = UploadedFile::fake()->create('huge.pdf', $maxSizeKb + 1, 'application/pdf');

        $response = $this->actingAs($user, 'sanctum')
            ->post('/api/v1/files', [
                'file' => $file,
                'name' => 'huge.pdf',
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }
}

<?php

namespace Tests\Feature;

use App\Models\File;
use App\Models\FileShare;
use App\Models\User;
use App\Contracts\StorageDaoInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class FileListAndDownloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_requires_authentication(): void
    {
        $this->getJson('/api/v1/files')->assertStatus(401);
    }

    public function test_list_returns_owned_files_with_role_owner(): void
    {
        $user = User::factory()->create();
        $this->createFileForUser($user, 'mon-fichier.pdf', 200);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/files');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.name', 'mon-fichier.pdf')
            ->assertJsonPath('data.0.role', 'owner');
    }

    public function test_list_returns_shared_files_with_role_reader(): void
    {
        $owner = User::factory()->create();
        $reader = User::factory()->create();
        $file = $this->createFileForUser($owner, 'partage.pdf', 100);
        FileShare::create(['file_id' => $file->id, 'user_id' => $reader->id, 'permission' => 'read']);

        $response = $this->actingAs($reader, 'sanctum')->getJson('/api/v1/files');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.name', 'partage.pdf')
            ->assertJsonPath('data.0.role', 'reader');
    }

    public function test_list_can_filter_by_tags(): void
    {
        $user = User::factory()->create();
        $f1 = $this->createFileForUser($user, 'a.pdf', 10, ['work']);
        $this->createFileForUser($user, 'b.pdf', 10, ['perso']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/files?tags[]=work');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('a.pdf', $response->json('data.0.name'));
    }

    public function test_download_requires_authentication(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'x.pdf', 50);

        $this->getJson('/api/v1/files/'.$file->id.'/download')->assertStatus(401);
    }

    public function test_download_returns_file_content_for_owner(): void
    {
        $user = User::factory()->create();
        $content = 'Contenu secret';
        $file = $this->createFileForUser($user, 'doc.txt', strlen($content), null, $content);

        $response = $this->actingAs($user, 'sanctum')
            ->get('/api/v1/files/'.$file->id.'/download');

        $response->assertStatus(200);
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('doc.txt', $response->headers->get('Content-Disposition'));
        $this->assertSame($content, $response->streamedContent());
    }

    public function test_download_returns_403_for_unauthorized_user(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $file = $this->createFileForUser($owner, 'privé.pdf', 10);

        $response = $this->actingAs($other, 'sanctum')
            ->get('/api/v1/files/'.$file->id.'/download');

        $response->assertStatus(403);
    }

    public function test_download_returns_file_for_shared_reader(): void
    {
        $owner = User::factory()->create();
        $reader = User::factory()->create();
        $content = 'Partagé';
        $file = $this->createFileForUser($owner, 'shared.txt', strlen($content), null, $content);
        FileShare::create(['file_id' => $file->id, 'user_id' => $reader->id, 'permission' => 'read']);

        $response = $this->actingAs($reader, 'sanctum')
            ->get('/api/v1/files/'.$file->id.'/download');

        $response->assertStatus(200);
        $this->assertSame($content, $response->streamedContent());
    }

    public function test_download_returns_403_with_requires_password_when_file_has_password(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'secret.pdf', 10, null, null, 'secret123');

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/files/'.$file->id.'/download');

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Ce fichier est protégé par mot de passe.')
            ->assertJsonPath('requires_password', true);
    }

    public function test_download_with_password_returns_401_for_wrong_password(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'secret.pdf', 10, null, null, 'goodpassword');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/download', [
                'password' => 'wrongpassword',
            ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Mot de passe incorrect.');
    }

    public function test_download_with_password_returns_file_for_correct_password(): void
    {
        $user = User::factory()->create();
        $content = 'Contenu protégé';
        $file = $this->createFileForUser($user, 'protected.txt', strlen($content), null, $content, 'mypass');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/download', [
                'password' => 'mypass',
            ]);

        $response->assertStatus(200);
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        $this->assertSame($content, $response->streamedContent());
    }

    public function test_download_with_password_returns_400_when_file_has_no_password(): void
    {
        $user = User::factory()->create();
        $file = $this->createFileForUser($user, 'public.pdf', 10);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files/'.$file->id.'/download', [
                'password' => 'any',
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'Ce fichier n\'est pas protégé par mot de passe.');
    }

    public function test_upload_can_set_file_password(): void
    {
        $user = User::factory()->create();
        $storage = $this->app->make(StorageDaoInterface::class);
        $storage->put('fake-key', 'content');
        $file = UploadedFile::fake()->createWithContent('doc.txt', 'hello');

        $response = $this->actingAs($user, 'sanctum')
            ->post('/api/v1/files', [
                'file' => $file,
                'name' => 'doc.txt',
                'password' => 'filepass',
            ]);

        $response->assertStatus(201);
        $fileModel = File::find($response->json('id'));
        $this->assertNotNull($fileModel->password);
        $this->assertTrue(Hash::check('filepass', $fileModel->password));
    }

    public function test_upload_rejects_file_password_shorter_than_6_characters(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->createWithContent('doc.txt', 'hello');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/files', [
                'file' => $file,
                'name' => 'doc.txt',
                'password' => '12345',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    private function createFileForUser(User $user, string $name, int $size, ?array $tags = null, ?string $content = null, ?string $password = null): File
    {
        $content = $content ?? str_repeat('x', $size);
        $storage = $this->app->make(StorageDaoInterface::class);
        $storageKey = (string) \Illuminate\Support\Str::uuid();
        $storage->put($storageKey, $content);

        $data = [
            'user_id' => $user->id,
            'name' => $name,
            'storage_key' => $storageKey,
            'size' => strlen($content),
            'mime_type' => 'application/octet-stream',
            'tags' => $tags,
        ];
        if ($password !== null) {
            $data['password'] = Hash::make($password);
        }

        return File::create($data);
    }
}

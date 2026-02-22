<?php

namespace Tests\Unit;

use App\Models\File;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FileModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedUsersAndFiles();
    }

    private function seedUsersAndFiles(): void
    {
        $user = User::factory()->create();
        File::create([
            'user_id' => $user->id,
            'name' => 'doc.pdf',
            'storage_key' => 'key-'.uniqid(),
            'size' => 1000,
            'mime_type' => 'application/pdf',
            'tags' => ['work', 'draft'],
        ]);
        File::create([
            'user_id' => $user->id,
            'name' => 'big.bin',
            'storage_key' => 'key-'.uniqid(),
            'size' => 5 * 1024 * 1024,
            'mime_type' => 'application/octet-stream',
            'tags' => ['archive'],
        ]);
        File::create([
            'user_id' => $user->id,
            'name' => 'small.txt',
            'storage_key' => 'key-'.uniqid(),
            'size' => 100,
            'mime_type' => 'text/plain',
            'tags' => null,
        ]);
    }

    public function test_scope_tagged_with_filters_by_tags(): void
    {
        $withWork = File::taggedWith(['work'])->get();
        $this->assertCount(1, $withWork);
        $this->assertSame('doc.pdf', $withWork->first()->name);

        $withArchive = File::taggedWith(['archive'])->get();
        $this->assertCount(1, $withArchive);

        $empty = File::taggedWith(['nonexistent'])->get();
        $this->assertCount(0, $empty);
    }

    public function test_scope_where_size_between_filters_by_size(): void
    {
        $small = File::whereSizeBetween(null, 500)->get();
        $this->assertCount(1, $small);
        $this->assertSame(100, $small->first()->size);

        $large = File::whereSizeBetween(4 * 1024 * 1024, null)->get();
        $this->assertCount(1, $large);
        $this->assertSame(5 * 1024 * 1024, $large->first()->size);

        $mid = File::whereSizeBetween(500, 2000)->get();
        $this->assertCount(1, $mid);
        $this->assertSame(1000, $mid->first()->size);
    }
}

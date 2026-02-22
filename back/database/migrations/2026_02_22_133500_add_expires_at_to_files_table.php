<?php

use App\Models\File;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('files', 'expires_at')) {
            Schema::table('files', function (Blueprint $table) {
                $table->timestamp('expires_at')->nullable()->after('tags');
            });
        }

        // Remplir l’expiration des fichiers qui ont déjà des liens (premier lien par id).
        File::query()
            ->whereNull('expires_at')
            ->whereHas('shareLinks')
            ->each(function (File $file): void {
                $first = $file->shareLinks()->orderBy('id')->first();
                if ($first !== null) {
                    $file->update(['expires_at' => $first->expires_at]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }
};

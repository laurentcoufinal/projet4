<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('storage_key')->unique();
            $table->unsignedBigInteger('size');
            $table->string('mime_type');
            $table->json('tags')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};

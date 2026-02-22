<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'storage_key',
        'size',
        'mime_type',
        'tags',
        'expires_at',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'size' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(FileShare::class);
    }

    public function shareLinks(): HasMany
    {
        return $this->hasMany(ShareLink::class);
    }

    /**
     * Filtre les fichiers contenant au moins un des tags donnés.
     *
     * @param  array<int, string>  $tags  Liste de tags (ex. ['work', 'draft'])
     */
    public function scopeTaggedWith(Builder $query, array $tags): void
    {
        if (empty($tags)) {
            return;
        }

        $query->where(function (Builder $q) use ($tags) {
            foreach ($tags as $tag) {
                $q->orWhereJsonContains('tags', $tag);
            }
        });
    }

    /**
     * Filtre les fichiers dont la taille est comprise entre min et max (octets).
     */
    public function scopeWhereSizeBetween(Builder $query, ?int $minBytes = null, ?int $maxBytes = null): void
    {
        if ($minBytes !== null) {
            $query->where('size', '>=', $minBytes);
        }
        if ($maxBytes !== null) {
            $query->where('size', '<=', $maxBytes);
        }
    }
}

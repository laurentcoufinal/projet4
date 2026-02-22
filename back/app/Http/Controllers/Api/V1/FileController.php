<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\StorageDaoInterface;
use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\FileShare;
use App\Models\ShareLink;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    private const MAX_FILE_SIZE_MB = 1024; // 1 Go

    public function __construct(
        private readonly StorageDaoInterface $storage
    ) {}

    /**
     * Liste des fichiers : propriétaire + partagés avec l'utilisateur. Filtres optionnels : tags[], size_min, size_max.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = File::query()
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('shares', fn ($s) => $s->where('user_id', $user->id));
            });

        if ($request->has('tags') && is_array($request->input('tags'))) {
            $query->taggedWith($request->input('tags'));
        }
        if ($request->filled('size_min')) {
            $query->whereSizeBetween((int) $request->input('size_min'), null);
        }
        if ($request->filled('size_max')) {
            $query->whereSizeBetween(null, (int) $request->input('size_max'));
        }

        $files = $query->with(['shares.user', 'shareLinks'])->orderByDesc('created_at')->get();

        $data = $files->map(function (File $file) use ($user) {
            $isOwner = $file->user_id === $user->id;
            $item = [
                'id' => $file->id,
                'name' => $file->name,
                'size' => $file->size,
                'mime_type' => $file->mime_type,
                'tags' => $file->tags,
                'created_at' => $file->created_at->toIso8601String(),
                'role' => $isOwner ? 'owner' : 'reader',
                'requires_password' => $file->password !== null,
            ];

            if ($isOwner) {
                $item['shared_with'] = $file->shares->map(fn ($s) => [
                    'user_id' => $s->user_id,
                    'email' => $s->user?->email,
                    'permission' => $s->permission,
                ])->values()->all();
                // Expiration des liens : chaque lien a sa propre date (share_links[].expires_at)
                $activeLinks = $file->shareLinks->filter(fn ($l) => $l->expires_at->isFuture());
                $item['share_links'] = $activeLinks->map(fn ($l) => [
                    'expires_at' => $l->expires_at->toIso8601String(),
                ])->values()->all();
                // Expiration du fichier (colonne files.expires_at), distincte des liens. Affichée dans la ligne.
                if ($file->expires_at !== null) {
                    $item['expires_at'] = $file->expires_at->toIso8601String();
                }
            }

            return $item;
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Téléchargement d'un fichier : accès si propriétaire ou partagé en lecture.
     * Si le fichier est protégé par mot de passe, retourne 403 et requires_password pour utiliser POST avec mot de passe.
     */
    public function download(Request $request, int $id): StreamedResponse|JsonResponse
    {
        $file = File::findOrFail($id);
        $user = $request->user();

        $canAccess = $file->user_id === $user->id
            || $file->shares()->where('user_id', $user->id)->exists();

        if (! $canAccess) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        if ($file->password !== null) {
            return response()->json([
                'message' => 'Ce fichier est protégé par mot de passe.',
                'requires_password' => true,
            ], 403);
        }

        if (! $this->storage->exists($file->storage_key)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        $stream = $this->storage->get($file->storage_key);

        return response()->streamDownload(function () use ($stream): void {
            if (is_resource($stream)) {
                fpassthru($stream);
                fclose($stream);
            } else {
                echo $stream;
            }
        }, $file->name, [
            'Content-Type' => $file->mime_type,
        ], 'attachment');
    }

    /**
     * Téléchargement d'un fichier protégé par mot de passe (POST avec body JSON password).
     */
    public function downloadWithPassword(Request $request, int $id): StreamedResponse|JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'max:255'],
        ]);

        $file = File::findOrFail($id);
        $user = $request->user();

        $canAccess = $file->user_id === $user->id
            || $file->shares()->where('user_id', $user->id)->exists();

        if (! $canAccess) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        if ($file->password === null) {
            return response()->json(['message' => 'Ce fichier n\'est pas protégé par mot de passe.'], 400);
        }

        if (! Hash::check($request->input('password'), $file->password)) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 401);
        }

        if (! $this->storage->exists($file->storage_key)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        $stream = $this->storage->get($file->storage_key);

        return response()->streamDownload(function () use ($stream): void {
            if (is_resource($stream)) {
                fpassthru($stream);
                fclose($stream);
            } else {
                echo $stream;
            }
        }, $file->name, [
            'Content-Type' => $file->mime_type,
        ], 'attachment');
    }

    /**
     * Suppression d'un fichier : réservée au propriétaire. Supprime les métadonnées et le binaire.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $file = File::findOrFail($id);
        $user = $request->user();

        if ($file->user_id !== $user->id) {
            return response()->json(['message' => 'Seul le propriétaire peut supprimer ce fichier.'], 403);
        }

        if ($this->storage->exists($file->storage_key)) {
            $this->storage->delete($file->storage_key);
        }

        $file->delete();

        return response()->json(['message' => 'Fichier supprimé.'], 200);
    }

    /**
     * Partager un fichier : attribuer un droit de lecture à un utilisateur (par user_id ou email). Réservé au propriétaire.
     */
    public function share(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'user_id' => ['required_without:email', 'nullable', 'integer', 'exists:users,id'],
            'email' => ['required_without:user_id', 'nullable', 'email', 'exists:users,email'],
        ], [
            'user_id.required_without' => 'Indiquez user_id ou email.',
            'email.required_without' => 'Indiquez user_id ou email.',
        ]);

        $file = File::findOrFail($id);
        $user = $request->user();

        if ($file->user_id !== $user->id) {
            return response()->json(['message' => 'Seul le propriétaire peut partager ce fichier.'], 403);
        }

        $targetUser = $request->filled('user_id')
            ? User::findOrFail($request->input('user_id'))
            : User::where('email', $request->input('email'))->firstOrFail();

        if ($targetUser->id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous partager un fichier à vous-même.'], 422);
        }

        $existing = FileShare::where('file_id', $file->id)->where('user_id', $targetUser->id)->first();
        if ($existing) {
            return response()->json([
                'message' => 'Le fichier est déjà partagé avec cet utilisateur.',
                'user_id' => $targetUser->id,
                'email' => $targetUser->email,
            ], 200);
        }

        FileShare::create([
            'file_id' => $file->id,
            'user_id' => $targetUser->id,
            'permission' => 'read',
        ]);

        return response()->json([
            'message' => 'Fichier partagé en lecture.',
            'user_id' => $targetUser->id,
            'email' => $targetUser->email,
        ], 201);
    }

    /**
     * Révoquer le partage : retirer l'accès d'un utilisateur. Réservé au propriétaire.
     */
    public function unshare(Request $request, int $id, int $userId): JsonResponse
    {
        $file = File::findOrFail($id);
        $user = $request->user();

        if ($file->user_id !== $user->id) {
            return response()->json(['message' => 'Seul le propriétaire peut révoquer un partage.'], 403);
        }

        $deleted = FileShare::where('file_id', $file->id)->where('user_id', $userId)->delete();

        if ($deleted === 0) {
            return response()->json(['message' => 'Aucun partage trouvé pour cet utilisateur.'], 404);
        }

        return response()->json(['message' => 'Partage révoqué.'], 200);
    }

    /**
     * Créer un lien de partage (réservé au propriétaire). Retourne l'URL et le token.
     */
    public function createShareLink(Request $request, int $id): JsonResponse
    {
        $file = File::findOrFail($id);
        $user = $request->user();

        if ($file->user_id !== $user->id) {
            return response()->json(['message' => 'Seul le propriétaire peut créer un lien de partage.'], 403);
        }

        $request->validate([
            'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $days = $request->input('expires_in_days', 7);
        $expiresAt = now()->addDays($days);
        $token = Str::random(64);

        ShareLink::create([
            'file_id' => $file->id,
            'token' => $token,
            'expires_at' => $expiresAt,
        ]);

        // Fixer l’expiration du fichier une seule fois (au premier lien) ; elle ne change pas quand on crée d’autres liens.
        if ($file->expires_at === null) {
            $file->update(['expires_at' => $expiresAt]);
        }

        $url = url("/api/v1/s/{$token}");

        return response()->json([
            'message' => 'Lien de partage créé.',
            'url' => $url,
            'token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
        ], 201);
    }

    /**
     * Télécharger un fichier via un token de partage (accès public, pas d'auth).
     */
    public function downloadByToken(string $token): StreamedResponse|JsonResponse
    {
        $shareLink = ShareLink::where('token', $token)->first();

        if (! $shareLink) {
            return response()->json(['message' => 'Lien invalide.'], 404);
        }

        if ($shareLink->expires_at->isPast()) {
            return response()->json(['message' => 'Ce lien a expiré.'], 410);
        }

        $file = $shareLink->file;

        if (! $this->storage->exists($file->storage_key)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        $stream = $this->storage->get($file->storage_key);

        return response()->streamDownload(function () use ($stream): void {
            if (is_resource($stream)) {
                fpassthru($stream);
                fclose($stream);
            } else {
                echo $stream;
            }
        }, $file->name, [
            'Content-Type' => $file->mime_type,
        ], 'attachment');
    }

    /**
     * Upload d'un fichier : envoi multipart (file) + name optionnel + tags optionnels.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:'.(self::MAX_FILE_SIZE_MB * 1024)],
            'name' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'password' => ['nullable', 'string', 'min:6', 'max:255'],
        ]);

        $uploaded = $request->file('file');
        $storageKey = (string) Str::uuid();
        $name = $request->input('name') ?? $uploaded->getClientOriginalName();
        $tags = $request->input('tags');
        $password = $request->input('password') ? Hash::make($request->input('password')) : null;

        $this->storage->put($storageKey, $uploaded->get());

        $file = File::create([
            'user_id' => $request->user()->id,
            'name' => $name,
            'storage_key' => $storageKey,
            'size' => $uploaded->getSize(),
            'mime_type' => $uploaded->getMimeType() ?: 'application/octet-stream',
            'tags' => $tags,
            'password' => $password,
        ]);

        return response()->json([
            'id' => $file->id,
            'name' => $file->name,
            'size' => $file->size,
            'mime_type' => $file->mime_type,
            'tags' => $file->tags,
            'created_at' => $file->created_at->toIso8601String(),
        ], 201);
    }
}

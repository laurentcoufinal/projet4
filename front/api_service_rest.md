Route::prefix('v1')->group(function (): void {
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::post('files', [FileController::class, 'store']);
        Route::get('files', [FileController::class, 'index']);
        Route::get('files/{id}/download', [FileController::class, 'download']);
        Route::delete('files/{id}', [FileController::class, 'destroy']);
        Route::post('files/{id}/share', [FileController::class, 'share']);
        Route::post('files/{id}/share-link', [FileController::class, 'shareLink']); /* body: { expires_in_days: 7 }, response: { token } */
        Route::delete('files/{id}/share/{userId}', [FileController::class, 'unshare']);
    });
    /* Sans auth : téléchargement via lien partagé */
    Route::get('s/{token}', [FileController::class, 'downloadShared']);

});

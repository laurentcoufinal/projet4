<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::get('s/{token}', [FileController::class, 'downloadByToken']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::post('files', [FileController::class, 'store']);
        Route::get('files', [FileController::class, 'index']);
        Route::get('files/{id}/download', [FileController::class, 'download']);
        Route::post('files/{id}/download', [FileController::class, 'downloadWithPassword']);
        Route::delete('files/{id}', [FileController::class, 'destroy']);
        Route::post('files/{id}/share', [FileController::class, 'share']);
        Route::delete('files/{id}/share/{userId}', [FileController::class, 'unshare']);
        Route::post('files/{id}/share-link', [FileController::class, 'createShareLink']);
    });
});

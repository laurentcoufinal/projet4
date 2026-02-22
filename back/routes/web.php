<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'API de partage de fichiers',
        'api' => '/api/v1',
    ]);
});

<?php

namespace App\Providers;

use App\Contracts\StorageDaoInterface;
use App\DAO\LocalStorageDao;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(StorageDaoInterface::class, function ($app) {
            return new LocalStorageDao(storage_path('app/uploads'));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

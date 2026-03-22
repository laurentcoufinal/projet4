<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class TestPgsqlCommand extends Command
{
    protected $signature = 'test:pgsql
        {--docker : Exécuter PHPUnit dans le conteneur php_pgsql (pdo_pgsql + DB_HOST=postgres)}
        {--without-tty : Désactiver le TTY pour la sortie}';

    protected $description = 'Lance PHPUnit avec phpunit.pgsql.xml (évite le conflit --configuration de `php artisan test`)';

    public function handle(): int
    {
        $phpunit = base_path('vendor/phpunit/phpunit/phpunit');
        $config = base_path('phpunit.pgsql.xml');

        if (! is_file($phpunit) || ! is_file($config)) {
            $this->error('PHPUnit ou phpunit.pgsql.xml introuvable.');

            return self::FAILURE;
        }

        if ($this->option('docker')) {
            return $this->runViaDocker();
        }

        $process = new Process(
            [PHP_BINARY, $phpunit, '-c', $config],
            base_path()
        );
        $process->setTimeout(null);

        if (! $this->option('without-tty') && Process::isTtySupported()) {
            try {
                $process->setTty(true);
            } catch (\Throwable) {
                // ignore
            }
        }

        return $process->run(function ($type, $buffer): void {
            $this->output->write($buffer);
        });
    }

    private function runViaDocker(): int
    {
        $this->info('Exécution via Docker (service php_pgsql)…');
        $this->newLine();

        // Chemins relatifs au volume monté dans le conteneur (pas base_path() hôte).
        $process = new Process(
            [
                'docker', 'compose', 'run', '--rm', 'php_pgsql',
                './vendor/bin/phpunit', '-c', 'phpunit.pgsql.xml',
            ],
            base_path()
        );
        $process->setTimeout(null);

        if (! $this->option('without-tty') && Process::isTtySupported()) {
            try {
                $process->setTty(true);
            } catch (\Throwable) {
                // ignore
            }
        }

        return $process->run(function ($type, $buffer): void {
            $this->output->write($buffer);
        });
    }
}

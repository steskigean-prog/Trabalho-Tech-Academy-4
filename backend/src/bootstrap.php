<?php

declare(strict_types=1);

/**
 * Autoload do namespace App\.
 *
 * Mapeia App\Classe para src/Classe.php seguindo a organização de pastas:
 * Controllers, Entities, Repositories, Services, Validators etc.
 */

spl_autoload_register(static function (string $classe): void {
    $prefixo = 'App\\';

    if (!str_starts_with($classe, $prefixo)) {
        return;
    }

    $relativa = str_replace('\\', '/', substr($classe, strlen($prefixo)));
    $arquivo = __DIR__ . '/' . $relativa . '.php';

    if (is_file($arquivo)) {
        require $arquivo;
    }
});

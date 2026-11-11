<?php

declare(strict_types=1);

namespace App\Exceptions;

/** Recurso inexistente (HTTP 404) — evita editar/excluir o que não existe. */
final class NotFoundException extends HttpException
{
    public function status(): int
    {
        return 404;
    }
}

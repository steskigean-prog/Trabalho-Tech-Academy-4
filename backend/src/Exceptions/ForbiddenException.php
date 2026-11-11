<?php

declare(strict_types=1);

namespace App\Exceptions;

/** Acesso negado mesmo autenticado (HTTP 403). */
final class ForbiddenException extends HttpException
{
    public function status(): int
    {
        return 403;
    }
}

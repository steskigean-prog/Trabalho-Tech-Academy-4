<?php

declare(strict_types=1);

namespace App\Exceptions;

/** Sem token, token inválido/expirado ou credenciais incorretas (HTTP 401). */
final class UnauthorizedException extends HttpException
{
    public function status(): int
    {
        return 401;
    }
}

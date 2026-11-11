<?php

declare(strict_types=1);

namespace App\Exceptions;

/** Conflito: e-mail/CPF duplicado ou registro com dependências (HTTP 409). */
final class ConflictException extends HttpException
{
    public function status(): int
    {
        return 409;
    }
}

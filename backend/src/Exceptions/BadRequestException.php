<?php

declare(strict_types=1);

namespace App\Exceptions;

/** Requisição malformada (HTTP 400). */
final class BadRequestException extends HttpException
{
    public function status(): int
    {
        return 400;
    }
}

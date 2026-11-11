<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

/**
 * Exceção base da API: carrega o status HTTP e detalhes opcionais por campo.
 *
 * Cada tipo de erro da aplicação é uma subclasse (ValidationException,
 * UnauthorizedException, NotFoundException, ConflictException...), o que
 * garante respostas consistentes e mensagens amigáveis no frontend.
 */
abstract class HttpException extends RuntimeException
{
    abstract public function status(): int;

    /**
     * @return array<string, string>|null
     */
    public function detalhes(): ?array
    {
        return null;
    }
}

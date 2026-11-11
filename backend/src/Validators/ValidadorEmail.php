<?php

declare(strict_types=1);

namespace App\Validators;

/** E-mail validado por expressão regular (exigência da rubrica). */
final class ValidadorEmail extends Validador
{
    private const PADRAO = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

    public function valido(mixed $valor): bool
    {
        return is_string($valor) && preg_match(self::PADRAO, trim($valor)) === 1;
    }

    public function mensagem(): string
    {
        return 'Informe um e-mail válido';
    }
}

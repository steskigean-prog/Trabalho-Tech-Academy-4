<?php

declare(strict_types=1);

namespace App\Validators;

/**
 * Nível de senha exigido pelo sistema.
 *
 * Regras: mínimo de 8 caracteres com ao menos uma letra maiúscula,
 * uma minúscula e um número.
 */
final class ValidadorSenha extends Validador
{
    public function valido(mixed $valor): bool
    {
        if (!is_string($valor)) {
            return false;
        }

        return strlen($valor) >= 8
            && preg_match('/[A-Z]/', $valor) === 1
            && preg_match('/[a-z]/', $valor) === 1
            && preg_match('/\d/', $valor) === 1;
    }

    public function mensagem(): string
    {
        return 'A senha deve ter ao menos 8 caracteres, com uma maiúscula, uma minúscula e um número';
    }
}

<?php

declare(strict_types=1);

namespace App\Validators;

/** Garante que o campo foi informado (não nulo, não vazio, não espaços). */
final class ValidadorObrigatorio extends Validador
{
    public function __construct(private readonly string $mensagemPersonalizada = 'Preencha este campo')
    {
    }

    public function valido(mixed $valor): bool
    {
        if ($valor === null) {
            return false;
        }

        if (is_array($valor)) {
            return $valor !== [];
        }

        return trim((string) $valor) !== '';
    }

    public function mensagem(): string
    {
        return $this->mensagemPersonalizada;
    }
}

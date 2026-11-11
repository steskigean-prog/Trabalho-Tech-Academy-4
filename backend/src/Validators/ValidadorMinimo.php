<?php

declare(strict_types=1);

namespace App\Validators;

/** Tamanho mínimo de caracteres (descontando espaços nas pontas). */
final class ValidadorMinimo extends Validador
{
    public function __construct(private readonly int $minimo)
    {
    }

    public function valido(mixed $valor): bool
    {
        return is_string($valor) && mb_strlen(trim($valor)) >= $this->minimo;
    }

    public function mensagem(): string
    {
        return "Informe ao menos {$this->minimo} caracteres";
    }
}

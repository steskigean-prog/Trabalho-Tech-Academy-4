<?php

declare(strict_types=1);

namespace App\Validators;

/**
 * Validador genérico por expressão regular.
 *
 * Reutilizado para código do YouTube e URL da capa, por exemplo.
 */
final class ValidadorRegex extends Validador
{
    public function __construct(
        private readonly string $padrao,
        private readonly string $mensagem
    ) {
    }

    /**
     * Aceita strings e escalares (JSON numérico), convertendo para texto —
     * ex.: o frontend envia o ano como número (2026), que deve validar em
     * /^\d{4}$/ da mesma forma que a string "2026".
     */
    public function valido(mixed $valor): bool
    {
        return is_scalar($valor) && preg_match($this->padrao, trim((string) $valor)) === 1;
    }

    public function mensagem(): string
    {
        return $this->mensagem;
    }
}

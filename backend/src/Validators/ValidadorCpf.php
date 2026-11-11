<?php

declare(strict_types=1);

namespace App\Validators;

/**
 * Validação de CPF com dígitos verificadores.
 *
 * Aceita com ou sem máscara (apenas os 11 dígitos são considerados) e
 * rejeita sequências repetidas como 111.111.111-11.
 */
final class ValidadorCpf extends Validador
{
    public function valido(mixed $valor): bool
    {
        if (!is_string($valor)) {
            return false;
        }

        $cpf = preg_replace('/\D/', '', $valor);

        if (strlen((string) $cpf) !== 11) {
            return false;
        }

        if (preg_match('/(\d)\1{10}/', (string) $cpf) === 1) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $soma = 0;

            for ($i = 0; $i < $t; $i++) {
                $soma += (int) $cpf[$i] * (($t + 1) - $i);
            }

            $digito = ((10 * $soma) % 11) % 10;

            if ((int) $cpf[$t] !== $digito) {
                return false;
            }
        }

        return true;
    }

    public function mensagem(): string
    {
        return 'Informe um CPF válido';
    }
}

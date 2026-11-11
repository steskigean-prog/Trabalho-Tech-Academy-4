<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ValidationException;

/**
 * Executa um conjunto de regras e acumula os erros por campo.
 *
 * Exemplo:
 *   Validacao::executar([
 *       'email' => [$dados['email'] ?? null, [new ValidadorObrigatorio(), new ValidadorEmail()]],
 *       'senha' => [$dados['senha'] ?? null, [new ValidadorObrigatorio(), new ValidadorSenha()]],
 *   ]);
 *
 * Se qualquer campo falhar, uma ValidationException é lançada com todos os
 * erros de uma vez (o frontend recebe { campo: mensagem } em detalhes).
 */
final class Validacao
{
    /**
     * @param array<string, array{0: mixed, 1: array<int, Validador>}> $regras
     */
    public static function executar(array $regras): void
    {
        $erros = [];

        foreach ($regras as $campo => [$valor, $validadores]) {
            foreach ($validadores as $validador) {
                if (!$validador->valido($valor)) {
                    $erros[$campo] = $validador->mensagem();
                    break;
                }
            }
        }

        if ($erros !== []) {
            throw new ValidationException($erros);
        }
    }
}

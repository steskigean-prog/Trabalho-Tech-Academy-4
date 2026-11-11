<?php

declare(strict_types=1);

namespace App\Validators;

/**
 * Contrato dos validadores de campo.
 *
 * Cada regra de negócio é uma subclasse (ValidadorEmail, ValidadorCpf,
 * ValidadorSenha, ValidadorMinimo, ValidadorRegex...), permitindo compor
 * validações e adicionar novas regras sem alterar o código que as executa
 * (princípios aberto/fechado e substituição de Liskov).
 */
abstract class Validador
{
    abstract public function valido(mixed $valor): bool;

    abstract public function mensagem(): string;
}

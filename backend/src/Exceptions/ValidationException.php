<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * Erros de validação de campos (HTTP 422).
 *
 * Os detalhes mapeiam campo -> mensagem para o formulário do frontend
 * destacar exatamente o que está incorreto.
 */
final class ValidationException extends HttpException
{
    /**
     * @param array<string, string> $erros
     */
    public function __construct(
        private readonly array $erros,
        string $mensagem = 'Dados inválidos'
    ) {
        parent::__construct($mensagem);
    }

    public function status(): int
    {
        return 422;
    }

    /**
     * @return array<string, string>
     */
    public function detalhes(): array
    {
        return $this->erros;
    }
}

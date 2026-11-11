<?php

declare(strict_types=1);

namespace App\Entities;

use App\Exceptions\ValidationException;

/**
 * Categoria (gênero) de filme.
 *
 * O nome é único no banco (constraint) e validado no setter.
 */
final class Categoria extends Entidade
{
    public function __construct(?int $id, private string $nome)
    {
        parent::__construct($id);
    }

    public function nome(): string
    {
        return $this->nome;
    }

    public function definirNome(string $nome): void
    {
        $nome = trim($nome);

        if (mb_strlen($nome) < 2) {
            throw new ValidationException(['categoria' => 'A categoria deve ter ao menos 2 caracteres']);
        }

        $this->nome = $nome;
    }

    /**
     * @return array<string, mixed>
     */
    public function paraArray(): array
    {
        return ['categoria' => $this->nome];
    }

    /**
     * @return array<string, mixed>
     */
    public function paraResposta(): array
    {
        return [
            'id' => $this->id,
            'categoria' => $this->nome,
        ];
    }

    public static function aPartirDoBanco(array $linha): self
    {
        return new self(
            (int) $linha['id'],
            (string) $linha['categoria']
        );
    }
}

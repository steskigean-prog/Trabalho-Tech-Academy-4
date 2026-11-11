<?php

declare(strict_types=1);

namespace App\Entities;

use App\Exceptions\ValidationException;

/**
 * Base para pessoas do catálogo (atores e diretores).
 *
 * Herança legítima: ambos compartilham nome e nacionalidade com as mesmas
 * regras; o comportamento polimórfico aparece em papel() e na hidratação
 * via new static() (late static binding).
 */
abstract class Pessoa extends Entidade
{
    protected function __construct(
        ?int $id,
        private string $nome,
        private string $nacionalidade
    ) {
        parent::__construct($id);
    }

    abstract public function papel(): string;

    public function nome(): string
    {
        return $this->nome;
    }

    public function definirNome(string $nome): void
    {
        $nome = trim($nome);

        if (mb_strlen($nome) < 3) {
            throw new ValidationException(['nome' => 'O nome deve ter ao menos 3 caracteres']);
        }

        $this->nome = $nome;
    }

    public function nacionalidade(): string
    {
        return $this->nacionalidade;
    }

    public function definirNacionalidade(string $nacionalidade): void
    {
        $nacionalidade = trim($nacionalidade);

        if (mb_strlen($nacionalidade) < 3) {
            throw new ValidationException(['nacionalidade' => 'A nacionalidade deve ter ao menos 3 caracteres']);
        }

        $this->nacionalidade = $nacionalidade;
    }

    /**
     * @return array<string, mixed>
     */
    public function paraArray(): array
    {
        return [
            'nome' => $this->nome,
            'nacionalidade' => $this->nacionalidade,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function paraResposta(): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'nacionalidade' => $this->nacionalidade,
            'papel' => $this->papel(),
        ];
    }

    /**
     * Hidrata a subclasse correta a partir de uma linha do banco.
     */
    public static function aPartirDoBanco(array $linha): static
    {
        return new static(
            (int) $linha['id'],
            (string) $linha['nome'],
            (string) $linha['nacionalidade']
        );
    }
}

<?php

declare(strict_types=1);

namespace App\Entities;

/** Diretor de filmes (relacionamento 1:N com filme). */
final class Diretor extends Pessoa
{
    public function __construct(?int $id, string $nome, string $nacionalidade)
    {
        parent::__construct($id, $nome, $nacionalidade);
    }

    public function papel(): string
    {
        return 'Direção';
    }
}

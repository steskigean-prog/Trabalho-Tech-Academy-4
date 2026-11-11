<?php

declare(strict_types=1);

namespace App\Entities;

/** Ator/atriz do elenco de filmes (relacionamento N:M com filme). */
final class Ator extends Pessoa
{
    public function __construct(?int $id, string $nome, string $nacionalidade)
    {
        parent::__construct($id, $nome, $nacionalidade);
    }

    public function papel(): string
    {
        return 'Ator/Atriz';
    }
}

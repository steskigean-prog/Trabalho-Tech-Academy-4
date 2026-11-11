<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Entities\Categoria;
use App\Entities\Entidade;

/** Repositório de categorias (gêneros). */
final class CategoriaRepository extends Repositorio
{
    protected function tabela(): string
    {
        return 'categoria';
    }

    protected function ordem(): string
    {
        return 'categoria';
    }

    protected function hidratar(array $linha): Entidade
    {
        return Categoria::aPartirDoBanco($linha);
    }

    /**
     * @param Entidade $entidade
     * @return array<string, mixed>
     */
    protected function valores(Entidade $entidade): array
    {
        return $entidade->paraArray();
    }

    protected function mensagemDuplicado(): string
    {
        return 'Já existe uma categoria com este nome';
    }

    protected function mensagemDependentes(): string
    {
        return 'Não é possível excluir: existem filmes nesta categoria';
    }
}

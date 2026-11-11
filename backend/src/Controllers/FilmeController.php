<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Entities\Entidade;
use App\Entities\Filme;
use App\Repositories\CategoriaRepository;
use App\Repositories\DiretorRepository;
use App\Repositories\FilmeRepository;
use App\Repositories\Repositorio;
use App\Validators\Validacao;
use App\Validators\ValidadorMinimo;
use App\Validators\ValidadorObrigatorio;
use App\Validators\ValidadorRegex;

/**
 * CRUD de filmes (todas as rotas autenticadas).
 *
 * Valida os campos obrigatórios, a existência das chaves estrangeiras
 * (categoria e diretor) e do elenco informado.
 */
final class FilmeController extends CrudController
{
    private const PADRAO_YOUTUBE = '/^[A-Za-z0-9_-]{11}$/';

    private const PADRAO_CAPA = '#^(https?://|/)\S+$#';

    protected function repositorio(): Repositorio
    {
        return new FilmeRepository();
    }

    protected function montar(array $dados, ?int $id): Entidade
    {
        Validacao::executar([
            'titulo' => [$dados['titulo'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(3)]],
            'original' => [$dados['original'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(2)]],
            'ano' => [$dados['ano'] ?? null, [new ValidadorObrigatorio(), new ValidadorRegex('/^\d{4}$/', 'Informe o ano com 4 dígitos')]],
            'categoria_id' => [$dados['categoria_id'] ?? null, [new ValidadorObrigatorio('Selecione a categoria')]],
            'diretor_id' => [$dados['diretor_id'] ?? null, [new ValidadorObrigatorio('Selecione o diretor')]],
            'youtube' => [$dados['youtube'] ?? null, [new ValidadorObrigatorio(), new ValidadorRegex(self::PADRAO_YOUTUBE, 'Informe o código do YouTube (11 caracteres)')]],
            'capa' => [$dados['capa'] ?? null, [new ValidadorObrigatorio(), new ValidadorRegex(self::PADRAO_CAPA, 'Informe a URL da capa')]],
            'sinopse' => [$dados['sinopse'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(10)]],
        ]);

        $ano = (int) $dados['ano'];

        if ($ano < 1895 || $ano > 2100) {
            throw new \App\Exceptions\ValidationException(['ano' => 'Informe um ano entre 1895 e 2100']);
        }

        $categoriaId = (int) $dados['categoria_id'];
        $diretorId = (int) $dados['diretor_id'];

        if (!(new CategoriaRepository())->existe($categoriaId)) {
            throw new \App\Exceptions\ValidationException(['categoria_id' => 'Categoria inexistente']);
        }

        if (!(new DiretorRepository())->existe($diretorId)) {
            throw new \App\Exceptions\ValidationException(['diretor_id' => 'Diretor inexistente']);
        }

        $elenco = $this->normalizarElenco($dados['elenco'] ?? []);

        if (!(new FilmeRepository())->atoresExistem($elenco)) {
            throw new \App\Exceptions\ValidationException(['elenco' => 'Um ou mais atores informados não existem']);
        }

        $filme = new Filme(
            $id,
            '',
            '',
            $ano,
            $categoriaId,
            $diretorId,
            '',
            '',
            ''
        );

        $filme->definirTitulo((string) $dados['titulo']);
        $filme->definirTituloOriginal((string) $dados['original']);
        $filme->definirYoutube((string) $dados['youtube']);
        $filme->definirCapa((string) $dados['capa']);
        $filme->definirSinopse((string) $dados['sinopse']);
        $filme->definirElenco(
            array_map(static fn (int $atorId): array => ['id' => $atorId, 'nome' => ''], $elenco)
        );

        return $filme;
    }

    /**
     * Aceita elenco como array de ids (números ou strings numéricas).
     *
     * @param array<int, mixed> $elenco
     * @return array<int, int>
     */
    private function normalizarElenco(array $elenco): array
    {
        $ids = [];

        foreach ($elenco as $valor) {
            if (is_numeric($valor)) {
                $ids[] = (int) $valor;
            }
        }

        return array_values(array_unique($ids));
    }
}

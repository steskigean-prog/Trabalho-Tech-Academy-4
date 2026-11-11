<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Entities\Entidade;
use App\Entities\Filme;
use PDO;
use PDOException;

/**
 * Repositório de filmes.
 *
 * Além do CRUD herdado, sincroniza o elenco (tabela filme_ator) em
 * transação e junta categoria e diretor nas consultas de leitura.
 */
final class FilmeRepository extends Repositorio
{
    protected function tabela(): string
    {
        return 'filme';
    }

    protected function ordem(): string
    {
        return 'filme.titulo';
    }

    protected function sqlListagem(): string
    {
        return 'SELECT filme.*, categoria.categoria AS categoria_nome, diretor.nome AS diretor_nome
                FROM filme
                INNER JOIN categoria ON categoria.id = filme.categoria_id
                INNER JOIN diretor ON diretor.id = filme.diretor_id';
    }

    protected function sqlBusca(): string
    {
        return $this->sqlListagem();
    }

    protected function chavePrimaria(): string
    {
        return 'filme.id';
    }

    protected function hidratar(array $linha): Entidade
    {
        $filme = new Filme(
            (int) $linha['id'],
            (string) $linha['titulo'],
            (string) $linha['original'],
            (int) $linha['ano'],
            (int) $linha['categoria_id'],
            (int) $linha['diretor_id'],
            (string) $linha['youtube'],
            (string) $linha['capa'],
            (string) $linha['sinopse'],
            isset($linha['categoria_nome']) ? (string) $linha['categoria_nome'] : null,
            isset($linha['diretor_nome']) ? (string) $linha['diretor_nome'] : null
        );

        $filme->definirElenco($this->elencoDoFilme((int) $linha['id']));

        return $filme;
    }

    /**
     * @param Entidade $entidade
     * @return array<string, mixed>
     */
    protected function valores(Entidade $entidade): array
    {
        return $entidade->paraArray();
    }

    public function inserir(Entidade $entidade): void
    {
        $this->pdo->beginTransaction();

        try {
            parent::inserir($entidade);
            $this->sincronizarElenco($entidade);

            $this->pdo->commit();
        } catch (PDOException $excecao) {
            $this->pdo->rollBack();
            throw $excecao;
        }
    }

    public function atualizar(int $id, Entidade $entidade): void
    {
        $this->pdo->beginTransaction();

        try {
            parent::atualizar($id, $entidade);
            $this->sincronizarElenco($entidade);

            $this->pdo->commit();
        } catch (PDOException $excecao) {
            $this->pdo->rollBack();
            throw $excecao;
        }
    }

    /**
     * O elenco antigo é apagado e o novo é inserido (ON DELETE CASCADE
     * também cobre exclusões diretas do filme).
     */
    private function sincronizarElenco(Entidade $entidade): void
    {
        if ($entidade->id() === null) {
            return;
        }

        $filmeId = $entidade->id();

        $remover = $this->pdo->prepare('DELETE FROM filme_ator WHERE filme_id = :filme_id');
        $remover->bindValue(':filme_id', $filmeId, PDO::PARAM_INT);
        $remover->execute();

        $inserir = $this->pdo->prepare(
            'INSERT INTO filme_ator (filme_id, ator_id) VALUES (:filme_id, :ator_id)'
        );

        foreach ($entidade->idsElenco() as $atorId) {
            $inserir->bindValue(':filme_id', $filmeId, PDO::PARAM_INT);
            $inserir->bindValue(':ator_id', $atorId, PDO::PARAM_INT);
            $inserir->execute();
        }
    }

    /**
     * @return array<int, array{id: int, nome: string}>
     */
    private function elencoDoFilme(int $filmeId): array
    {
        $consulta = $this->pdo->prepare(
            'SELECT ator.id, ator.nome
             FROM filme_ator
             INNER JOIN ator ON ator.id = filme_ator.ator_id
             WHERE filme_ator.filme_id = :filme_id
             ORDER BY ator.nome'
        );

        $consulta->bindValue(':filme_id', $filmeId, PDO::PARAM_INT);
        $consulta->execute();

        $elenco = [];

        while ($linha = $consulta->fetch()) {
            $elenco[] = [
                'id' => (int) $linha['id'],
                'nome' => (string) $linha['nome'],
            ];
        }

        return $elenco;
    }

    /**
     * Valida se todos os atores informados existem.
     *
     * @param array<int, int> $ids
     */
    public function atoresExistem(array $ids): bool
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));

        if ($ids === []) {
            return true;
        }

        $marcadores = implode(', ', array_map(static fn (int $i): string => ":ator_$i", range(0, count($ids) - 1)));

        $consulta = $this->pdo->prepare("SELECT COUNT(DISTINCT id) FROM ator WHERE id IN ($marcadores)");

        foreach ($ids as $indice => $id) {
            $consulta->bindValue(":ator_$indice", $id, PDO::PARAM_INT);
        }

        $consulta->execute();

        return (int) $consulta->fetchColumn() === count($ids);
    }
}

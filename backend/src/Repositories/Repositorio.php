<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use App\Entities\Entidade;
use App\Exceptions\ConflictException;
use PDO;
use PDOException;
use PDOStatement;
use Throwable;

/**
 * Repositório base: CRUD genérico com paginação.
 *
 * Cada repositório concreto define apenas tabela(), ordem(), hidratar() e
 * valores() — o comportamento comum (inserir, atualizar, excluir, listar
 * paginado, tratar duplicidades) vive aqui (reuso sem duplicação).
 */
abstract class Repositorio
{
    protected PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::conexao();
    }

    abstract protected function tabela(): string;

    /** Coluna segura de ordenação (nunca vem da requisição). */
    abstract protected function ordem(): string;

    /**
     * Converte uma linha do banco na entidade correspondente.
     */
    abstract protected function hidratar(array $linha): Entidade;

    /**
     * Colunas e valores para INSERT/UPDATE a partir da entidade.
     *
     * @return array<string, mixed>
     */
    abstract protected function valores(Entidade $entidade): array;

    /**
     * Listagem paginada.
     *
     * @return array{data: array<int, Entidade>, meta: array{pagina: int, limite: int, total: int, paginas: int}}
     */
    public function paginar(int $pagina, int $limite): array
    {
        $pagina = max(1, $pagina);
        $limite = min(100, max(1, $limite));
        $offset = ($pagina - 1) * $limite;

        $contagem = $this->pdo->query("SELECT COUNT(*) FROM {$this->tabela()}");
        $total = (int) ($contagem->fetchColumn() ?: 0);

        $consulta = $this->pdo->prepare(
            $this->sqlListagem() . " ORDER BY {$this->ordem()} LIMIT :limite OFFSET :offset"
        );

        $consulta->bindValue(':limite', $limite, PDO::PARAM_INT);
        $consulta->bindValue(':offset', $offset, PDO::PARAM_INT);
        $consulta->execute();

        $registros = [];

        while ($linha = $consulta->fetch()) {
            $registros[] = $this->hidratar($linha);
        }

        return [
            'data' => $registros,
            'meta' => [
                'pagina' => $pagina,
                'limite' => $limite,
                'total' => $total,
                'paginas' => (int) max(1, (int) ceil($total / $limite)),
            ],
        ];
    }

    /**
     * SQL da listagem — sobrescrito quando há junções.
     */
    protected function sqlListagem(): string
    {
        return "SELECT * FROM {$this->tabela()}";
    }

    public function buscar(int $id): ?Entidade
    {
        $consulta = $this->pdo->prepare(
            $this->sqlBusca() . ' WHERE ' . $this->chavePrimaria() . ' = :id LIMIT 1'
        );

        $consulta->bindValue(':id', $id, PDO::PARAM_INT);
        $consulta->execute();

        $linha = $consulta->fetch();

        return $linha === false ? null : $this->hidratar($linha);
    }

    /**
     * SQL da busca por id — sobrescrito quando há junções.
     */
    protected function sqlBusca(): string
    {
        return "SELECT * FROM {$this->tabela()}";
    }

    protected function chavePrimaria(): string
    {
        return "{$this->tabela()}.id";
    }

    public function existe(int $id): bool
    {
        $consulta = $this->pdo->prepare("SELECT COUNT(*) FROM {$this->tabela()} WHERE id = :id");
        $consulta->bindValue(':id', $id, PDO::PARAM_INT);
        $consulta->execute();

        return (int) $consulta->fetchColumn() > 0;
    }

    public function total(): int
    {
        $contagem = $this->pdo->query("SELECT COUNT(*) FROM {$this->tabela()}");

        return (int) ($contagem->fetchColumn() ?: 0);
    }

    public function inserir(Entidade $entidade): void
    {
        $valores = $this->valores($entidade);
        $colunas = array_keys($valores);
        $marcadores = array_map(static fn (string $coluna): string => ":$coluna", $colunas);

        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $this->tabela(),
            implode(', ', $colunas),
            implode(', ', $marcadores)
        );

        try {
            $consulta = $this->pdo->prepare($sql);
            $this->vincular($consulta, $valores);
            $consulta->execute();

            $entidade->definirId((int) $this->pdo->lastInsertId());
        } catch (PDOException $excecao) {
            throw $this->traduzirDuplicidade($excecao, $this->mensagemDuplicado());
        }
    }

    public function atualizar(int $id, Entidade $entidade): void
    {
        $valores = $this->valores($entidade);

        $definicoes = array_map(
            static fn (string $coluna): string => "$coluna = :$coluna",
            array_keys($valores)
        );

        $sql = sprintf(
            'UPDATE %s SET %s WHERE id = :id',
            $this->tabela(),
            implode(', ', $definicoes)
        );

        try {
            $consulta = $this->pdo->prepare($sql);
            $this->vincular($consulta, $valores);
            $consulta->bindValue(':id', $id, PDO::PARAM_INT);
            $consulta->execute();
        } catch (PDOException $excecao) {
            throw $this->traduzirDuplicidade($excecao, $this->mensagemDuplicado());
        }
    }

    public function excluir(int $id): void
    {
        $sql = "DELETE FROM {$this->tabela()} WHERE id = :id";

        try {
            $consulta = $this->pdo->prepare($sql);
            $consulta->bindValue(':id', $id, PDO::PARAM_INT);
            $consulta->execute();
        } catch (PDOException $excecao) {
            throw $this->traduzirDuplicidade($excecao, $this->mensagemDependentes());
        }
    }

    /**
     * @param array<string, mixed> $valores
     */
    private function vincular(PDOStatement $consulta, array $valores): void
    {
        foreach ($valores as $coluna => $valor) {
            $consulta->bindValue(
                ":$coluna",
                $valor,
                is_int($valor) ? PDO::PARAM_INT : PDO::PARAM_STR
            );
        }
    }

    private function traduzirDuplicidade(PDOException $excecao, string $mensagem): Throwable
    {
        if ($excecao->getCode() === '23000') {
            return new ConflictException($mensagem);
        }

        return $excecao;
    }

    protected function mensagemDuplicado(): string
    {
        return 'Já existe um registro com estes dados';
    }

    protected function mensagemDependentes(): string
    {
        return 'Não é possível excluir: existem registros vinculados';
    }
}

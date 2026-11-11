<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Entities\Entidade;
use App\Exceptions\NotFoundException;
use App\Repositories\Repositorio;
use App\Support\Resposta;

/**
 * Controlador genérico de CRUD.
 *
 * Implementa as cinco operações (listar com paginação, criar, buscar,
 * atualizar e excluir) com verificação de existência antes de editar ou
 * excluir (HTTP 404). As subclasses apenas fornecem o repositório e a
 * montagem/validação da entidade (template method).
 */
abstract class CrudController
{
    abstract protected function repositorio(): Repositorio;

    /**
     * Valida os dados de entrada e monta a entidade pronta para persistir.
     */
    abstract protected function montar(array $dados, ?int $id): Entidade;

    public function index(Request $requisicao): never
    {
        $pagina = $requisicao->consultaInteira('pagina', 1);
        $limite = $requisicao->consultaInteira('limite', 10);

        Resposta::sucesso($this->repositorio()->paginar($pagina, $limite));
    }

    public function store(Request $requisicao): never
    {
        $entidade = $this->montar($requisicao->corpoCompleto(), null);

        $this->repositorio()->inserir($entidade);

        Resposta::criado($entidade);
    }

    public function show(Request $requisicao, int $id): never
    {
        $entidade = $this->repositorio()->buscar($id);

        if ($entidade === null) {
            throw new NotFoundException('Registro não encontrado');
        }

        Resposta::sucesso($entidade);
    }

    public function update(Request $requisicao, int $id): never
    {
        if ($this->repositorio()->buscar($id) === null) {
            throw new NotFoundException('Registro não encontrado para edição');
        }

        $entidade = $this->montar($requisicao->corpoCompleto(), $id);

        $this->repositorio()->atualizar($id, $entidade);

        Resposta::sucesso($entidade);
    }

    public function destroy(Request $requisicao, int $id): never
    {
        if ($this->repositorio()->buscar($id) === null) {
            throw new NotFoundException('Registro não encontrado para exclusão');
        }

        $this->repositorio()->excluir($id);

        Resposta::sucesso(['mensagem' => 'Registro excluído com sucesso']);
    }
}

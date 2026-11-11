<?php

declare(strict_types=1);

namespace App\Entities;

use JsonSerializable;

/**
 * Entidade base do domínio.
 *
 * O identificador é protegido: subclasses e chamadores externos só o
 * manipulam pelos accessors, mantendo o estado interno consistente.
 * Cada entidade sabe se serializar (paraResposta) e se persistir
 * (paraArray, colunas da tabela sem o id).
 */
abstract class Entidade implements JsonSerializable
{
    protected function __construct(protected ?int $id = null)
    {
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function definirId(int $id): void
    {
        $this->id = $id;
    }

    /**
     * Colunas persistíveis (sem o id, gerado pelo banco).
     *
     * @return array<string, mixed>
     */
    abstract public function paraArray(): array;

    /**
     * Representação enviada pela API.
     *
     * @return array<string, mixed>
     */
    abstract public function paraResposta(): array;

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->paraResposta();
    }
}

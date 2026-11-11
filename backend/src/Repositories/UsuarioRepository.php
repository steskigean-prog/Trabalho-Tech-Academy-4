<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Entities\Entidade;
use App\Entities\Usuario;
use PDO;

/**
 * Repositório de usuários.
 *
 * Consultas específicas de autenticação (busca por e-mail, unicidade de
 * e-mail/CPF) além do CRUD padrão.
 */
final class UsuarioRepository extends Repositorio
{
    protected function tabela(): string
    {
        return 'usuario';
    }

    protected function ordem(): string
    {
        return 'usuario.nome';
    }

    protected function hidratar(array $linha): Entidade
    {
        return Usuario::aPartirDoBanco($linha);
    }

    /**
     * @param Entidade $entidade
     * @return array<string, mixed>
     */
    protected function valores(Entidade $entidade): array
    {
        return $entidade->paraArray();
    }

    /**
     * Busca um usuário ativo pelo e-mail (login só permite usuário existente
     * e ativo).
     */
    public function buscarPorEmail(string $email): ?Usuario
    {
        $consulta = $this->pdo->prepare(
            "SELECT * FROM usuario WHERE email = :email AND ativo = 'Sim' LIMIT 1"
        );

        $consulta->bindValue(':email', $email);
        $consulta->execute();

        $linha = $consulta->fetch();

        return $linha === false ? null : Usuario::aPartirDoBanco($linha);
    }

    /**
     * Busca um usuário ativo pelo id (validação do token JWT).
     */
    public function buscarAtivoPorId(int $id): ?Usuario
    {
        $consulta = $this->pdo->prepare(
            "SELECT * FROM usuario WHERE id = :id AND ativo = 'Sim' LIMIT 1"
        );

        $consulta->bindValue(':id', $id, PDO::PARAM_INT);
        $consulta->execute();

        $linha = $consulta->fetch();

        return $linha === false ? null : Usuario::aPartirDoBanco($linha);
    }

    /**
     * E-mail já usado por outro usuário (excluindo o próprio id informado).
     */
    public function emailExiste(string $email, ?int $excetoId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM usuario WHERE email = :email';
        $parametros = ['email' => $email];

        if ($excetoId !== null) {
            $sql .= ' AND id <> :id';
            $parametros['id'] = $excetoId;
        }

        $consulta = $this->pdo->prepare($sql);
        $consulta->bindValue(':email', $email);

        if ($excetoId !== null) {
            $consulta->bindValue(':id', $excetoId, PDO::PARAM_INT);
        }

        $consulta->execute();

        return (int) $consulta->fetchColumn() > 0;
    }

    /**
     * CPF já usado por outro usuário (excluindo o próprio id informado).
     */
    public function cpfExiste(string $cpf, ?int $excetoId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM usuario WHERE cpf = :cpf';

        if ($excetoId !== null) {
            $sql .= ' AND id <> :id';
        }

        $consulta = $this->pdo->prepare($sql);
        $consulta->bindValue(':cpf', $cpf);

        if ($excetoId !== null) {
            $consulta->bindValue(':id', $excetoId, PDO::PARAM_INT);
        }

        $consulta->execute();

        return (int) $consulta->fetchColumn() > 0;
    }

    protected function mensagemDuplicado(): string
    {
        return 'E-mail ou CPF já cadastrado';
    }
}

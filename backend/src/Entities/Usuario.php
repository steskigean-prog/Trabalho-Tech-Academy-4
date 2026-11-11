<?php

declare(strict_types=1);

namespace App\Entities;

use App\Exceptions\ValidationException;
use App\Validators\ValidadorCpf;

/**
 * Usuário da aplicação.
 *
 * Regras de encapsulamento:
 * - a senha trafega apenas como hash bcrypt (nunca em paraResposta);
 * - o e-mail não possui setter: é imutável após o cadastro;
 * - nome e CPF possuem setters com validação de regra de negócio.
 */
final class Usuario extends Entidade
{
    public function __construct(
        ?int $id,
        private string $nome,
        private readonly string $email,
        private string $cpf,
        private readonly bool $ativo = true,
        private string $senhaHash = ''
    ) {
        parent::__construct($id);
    }

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

    public function email(): string
    {
        return $this->email;
    }

    public function cpf(): string
    {
        return $this->cpf;
    }

    public function definirCpf(string $cpf): void
    {
        $somenteDigitos = preg_replace('/\D/', '', $cpf) ?? '';

        if (!(new ValidadorCpf())->valido($somenteDigitos)) {
            throw new ValidationException(['cpf' => 'CPF inválido']);
        }

        $this->cpf = $somenteDigitos;
    }

    public function ativo(): bool
    {
        return $this->ativo;
    }

    public function senhaHash(): string
    {
        return $this->senhaHash;
    }

    /**
     * Recebe a senha em texto e armazena apenas o hash bcrypt.
     */
    public function definirSenha(string $senha): void
    {
        $this->senhaHash = password_hash($senha, PASSWORD_BCRYPT);
    }

    /**
     * Verifica a senha informada contra o hash armazenado.
     */
    public function conferirSenha(string $senha): bool
    {
        return password_verify($senha, $this->senhaHash);
    }

    /**
     * @return array<string, mixed>
     */
    public function paraArray(): array
    {
        return [
            'nome' => $this->nome,
            'email' => $this->email,
            'senha' => $this->senhaHash,
            'cpf' => $this->cpf,
            'ativo' => $this->ativo ? 'Sim' : 'Não',
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
            'email' => $this->email,
            'cpf' => $this->cpf,
            'ativo' => $this->ativo,
        ];
    }

    /**
     * Hidrata um usuário a partir de uma linha do banco.
     */
    public static function aPartirDoBanco(array $linha): self
    {
        return new self(
            (int) $linha['id'],
            (string) $linha['nome'],
            (string) $linha['email'],
            (string) $linha['cpf'],
            ($linha['ativo'] ?? 'Sim') === 'Sim',
            (string) $linha['senha']
        );
    }
}

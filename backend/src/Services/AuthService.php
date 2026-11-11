<?php

declare(strict_types=1);

namespace App\Services;

use App\Entities\Usuario;
use App\Exceptions\ConflictException;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Repositories\UsuarioRepository;
use App\Support\Env;
use App\Support\Jwt;
use App\Validators\Validacao;
use App\Validators\ValidadorCpf;
use App\Validators\ValidadorEmail;
use App\Validators\ValidadorMinimo;
use App\Validators\ValidadorObrigatorio;
use App\Validators\ValidadorSenha;

/**
 * Regras de negócio de autenticação e perfil do usuário.
 *
 * - login: apenas usuários existentes e ativos, com e-mail validado por regex;
 * - registro: campos obrigatórios (nome, e-mail, senha e CPF) com validações;
 * - perfil: edição apenas do próprio usuário, sem troca de e-mail, com
 *   todos os campos obrigatórios.
 */
final class AuthService
{
    private readonly UsuarioRepository $usuarios;

    private readonly Jwt $jwt;

    public function __construct(?UsuarioRepository $usuarios = null, ?Jwt $jwt = null)
    {
        $this->usuarios = $usuarios ?? new UsuarioRepository();
        $this->jwt = $jwt ?? new Jwt(
            (string) Env::obter('JWT_SECRET', 'imdb-segredo-local'),
            (int) Env::obter('JWT_EXPIRACAO', '86400')
        );
    }

    /**
     * Login com e-mail e senha. Retorna o token JWT e o usuário.
     *
     * @return array{token: string, usuario: Usuario}
     */
    public function login(string $email, string $senha): array
    {
        Validacao::executar([
            'email' => [$email, [new ValidadorObrigatorio('Preencha o e-mail'), new ValidadorEmail()]],
            'senha' => [$senha, [new ValidadorObrigatorio('Preencha a senha')]],
        ]);

        $usuario = $this->usuarios->buscarPorEmail(trim($email));

        if ($usuario === null || !$usuario->conferirSenha($senha)) {
            throw new UnauthorizedException('E-mail ou senha incorretos');
        }

        return [
            'token' => $this->jwt->emitir($usuario->id()),
            'usuario' => $usuario,
        ];
    }

    /**
     * Cadastro público de usuário (nome, e-mail, senha e CPF obrigatórios).
     */
    public function registro(array $dados): Usuario
    {
        Validacao::executar([
            'nome' => [$dados['nome'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(3)]],
            'email' => [$dados['email'] ?? null, [new ValidadorObrigatorio(), new ValidadorEmail()]],
            'senha' => [$dados['senha'] ?? null, [new ValidadorObrigatorio(), new ValidadorSenha()]],
            'cpf' => [$dados['cpf'] ?? null, [new ValidadorObrigatorio(), new ValidadorCpf()]],
        ]);

        $email = trim((string) $dados['email']);
        $cpf = preg_replace('/\D/', '', (string) $dados['cpf']) ?? '';

        if ($this->usuarios->emailExiste($email)) {
            throw new ConflictException('Este e-mail já está cadastrado');
        }

        if ($this->usuarios->cpfExiste($cpf)) {
            throw new ConflictException('Este CPF já está cadastrado');
        }

        $usuario = new Usuario(null, trim((string) $dados['nome']), $email, $cpf, true);
        $usuario->definirSenha((string) $dados['senha']);

        $this->usuarios->inserir($usuario);

        return $usuario;
    }

    /**
     * Dados do próprio usuário (rota autenticada).
     */
    public function perfil(int $usuarioId): Usuario
    {
        $usuario = $this->usuarios->buscar($usuarioId);

        if ($usuario === null) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return $usuario;
    }

    /**
     * Edição do próprio perfil.
     *
     * Regras: todos os campos (nome, senha e CPF) são obrigatórios; o e-mail
     * não pode ser alterado — se vier diferente do cadastrado, é recusado.
     *
     * @param array<string, mixed> $dados
     */
    public function atualizarPerfil(int $usuarioId, array $dados): Usuario
    {
        $usuario = $this->perfil($usuarioId);

        if (isset($dados['email']) && trim((string) $dados['email']) !== $usuario->email()) {
            throw new ConflictException('O e-mail não pode ser alterado');
        }

        Validacao::executar([
            'nome' => [$dados['nome'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(3)]],
            'cpf' => [$dados['cpf'] ?? null, [new ValidadorObrigatorio(), new ValidadorCpf()]],
            'senha' => [$dados['senha'] ?? null, [new ValidadorObrigatorio(), new ValidadorSenha()]],
        ]);

        $cpf = preg_replace('/\D/', '', (string) $dados['cpf']) ?? '';

        if ($this->usuarios->cpfExiste($cpf, $usuarioId)) {
            throw new ConflictException('Este CPF já está cadastrado por outro usuário');
        }

        $usuario->definirNome((string) $dados['nome']);
        $usuario->definirCpf($cpf);
        $usuario->definirSenha((string) $dados['senha']);

        $this->usuarios->atualizar($usuarioId, $usuario);

        return $usuario;
    }
}

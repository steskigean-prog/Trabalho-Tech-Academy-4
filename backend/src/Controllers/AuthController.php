<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Services\AuthService;
use App\Support\Resposta;

/**
 * Autenticação: registro público e login com retorno de token JWT.
 */
final class AuthController
{
    public function __construct(private readonly AuthService $auth = new AuthService())
    {
    }

    /**
     * POST /api/auth/registro — cadastro público de usuário.
     */
    public function registro(Request $requisicao): never
    {
        $usuario = $this->auth->registro($requisicao->corpoCompleto());

        Resposta::criado([
            'mensagem' => 'Cadastro realizado com sucesso',
            'usuario' => $usuario,
        ]);
    }

    /**
     * POST /api/auth/login — retorna token JWT para usuário existente.
     */
    public function login(Request $requisicao): never
    {
        $resultado = $this->auth->login(
            (string) $requisicao->corpo('email', ''),
            (string) $requisicao->corpo('senha', '')
        );

        Resposta::sucesso([
            'token' => $resultado['token'],
            'usuario' => $resultado['usuario'],
        ]);
    }
}

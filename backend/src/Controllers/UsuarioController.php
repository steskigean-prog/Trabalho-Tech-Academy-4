<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Services\AuthService;
use App\Support\Resposta;

/**
 * Perfil do usuário logado (rotas autenticadas).
 *
 * A rota sempre opera sobre o id do token: um usuário só consulta e edita
 * o próprio cadastro.
 */
final class UsuarioController
{
    public function __construct(private readonly AuthService $auth = new AuthService())
    {
    }

    /**
     * GET /api/perfil — dados do usuário autenticado.
     */
    public function perfil(Request $requisicao): never
    {
        Resposta::sucesso($this->auth->perfil($requisicao->usuarioId()));
    }

    /**
     * PUT /api/perfil — edita o próprio usuário (todos os campos
     * obrigatórios, sem permitir troca de e-mail).
     */
    public function atualizar(Request $requisicao): never
    {
        $usuario = $this->auth->atualizarPerfil(
            $requisicao->usuarioId(),
            $requisicao->corpoCompleto()
        );

        Resposta::sucesso([
            'mensagem' => 'Perfil atualizado com sucesso',
            'usuario' => $usuario,
        ]);
    }
}

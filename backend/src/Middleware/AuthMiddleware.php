<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Exceptions\UnauthorizedException;
use App\Repositories\UsuarioRepository;
use App\Support\Env;
use App\Support\Jwt;

/**
 * Middleware de autenticação.
 *
 * Protege as rotas autenticadas: valida o token Bearer (assinatura e
 * expiração) e recarrega o usuário do banco, garantindo que o token
 * pertence a um usuário existente e ativo.
 */
final class AuthMiddleware
{
    public static function proteger(Request $requisicao): void
    {
        $autorizacao = $requisicao->cabecalho('authorization');

        if ($autorizacao === null || preg_match('/^Bearer\s+(\S+)$/i', $autorizacao, $correspondencia) !== 1) {
            throw new UnauthorizedException('Token de autenticação ausente ou malformado');
        }

        $jwt = new Jwt(
            (string) Env::obter('JWT_SECRET', 'imdb-segredo-local'),
            (int) Env::obter('JWT_EXPIRACAO', '86400')
        );

        $claims = $jwt->verificar($correspondencia[1]);

        if ($claims === null) {
            throw new UnauthorizedException('Sessão expirada ou token inválido. Faça login novamente.');
        }

        $repositorio = new UsuarioRepository();
        $usuario = $repositorio->buscarAtivoPorId((int) ($claims['sub'] ?? 0));

        if ($usuario === null) {
            throw new UnauthorizedException('Usuário não encontrado ou inativo');
        }

        $requisicao->definirUsuario([
            'id' => $usuario->id(),
            'nome' => $usuario->nome(),
            'email' => $usuario->email(),
        ]);
    }
}

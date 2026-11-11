<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Respostas JSON padronizadas da API.
 *
 * Sucesso: o recurso serializado (Entidades implementam JsonSerializable).
 * Erro:   { "erro": mensagem, "codigo": status, "detalhes": { campo: motivo } }
 */
final class Resposta
{
    public static function sucesso(mixed $dados, int $status = 200): never
    {
        self::enviar($dados, $status);
    }

    public static function criado(mixed $dados): never
    {
        self::enviar($dados, 201);
    }

    /**
     * @param array<string, string>|null $detalhes erros por campo
     */
    public static function erro(string $mensagem, int $status, ?array $detalhes = null): never
    {
        $corpo = ['erro' => $mensagem, 'codigo' => $status];

        if ($detalhes !== null) {
            $corpo['detalhes'] = $detalhes;
        }

        self::enviar($corpo, $status);
    }

    private static function enviar(mixed $dados, int $status): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}

<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use App\Support\Env;

/**
 * Conexão única (singleton) com o MySQL via PDO.
 *
 * As credenciais vêm das variáveis de ambiente definidas no docker-compose
 * (DB_HOST, DB_NAME, DB_USER, DB_PASS).
 */
final class Database
{
    private static ?PDO $conexao = null;

    public static function conexao(): PDO
    {
        if (self::$conexao === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=utf8mb4',
                Env::obter('DB_HOST', 'db'),
                Env::obter('DB_NAME', 'imdb')
            );

            try {
                self::$conexao = new PDO(
                    $dsn,
                    (string) Env::obter('DB_USER', 'root'),
                    (string) Env::obter('DB_PASS', ''),
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $excecao) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'erro' => 'Falha ao conectar ao banco de dados',
                    'codigo' => 500,
                ]);
                exit;
            }
        }

        return self::$conexao;
    }
}

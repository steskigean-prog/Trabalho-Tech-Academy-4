<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Requisição HTTP capturada com método, caminho, consulta, corpo JSON,
 * cabeçalhos e — após o middleware de autenticação — o usuário logado.
 */
final class Request
{
    /** @var array{id?: int, nome?: string, email?: string} */
    private array $usuario = [];

    /**
     * @param array<string, mixed> $consulta parâmetros de query string
     * @param array<string, mixed> $corpo corpo JSON decodificado
     * @param array<string, string> $cabecalhos cabeçalhos em minúsculas
     */
    public function __construct(
        private readonly string $metodo,
        private readonly string $caminho,
        private readonly array $consulta,
        private readonly array $corpo,
        private readonly array $cabecalhos
    ) {
    }

    /**
     * Constrói a requisição a partir das superglobais, removendo o
     * prefixo /api adicionado pelo proxy reverso (Nginx).
     */
    public static function capturar(): self
    {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

        if (str_starts_with($uri, '/api')) {
            $uri = substr($uri, 4) ?: '/';
        }

        $bruto = file_get_contents('php://input') ?: '';
        $corpo = json_decode($bruto, true);

        if (!is_array($corpo)) {
            $corpo = [];
        }

        return new self(
            strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            $uri,
            $_GET,
            $corpo,
            self::capturarCabecalhos()
        );
    }

    public function metodo(): string
    {
        return $this->metodo;
    }

    public function caminho(): string
    {
        return $this->caminho;
    }

    public function consulta(string $chave, ?string $padrao = null): ?string
    {
        return $this->consulta[$chave] ?? $padrao;
    }

    /**
     * Parâmetro de consulta inteiro e positivo (paginação).
     */
    public function consultaInteira(string $chave, int $padrao, int $minimo = 1): int
    {
        $valor = filter_var($this->consulta[$chave] ?? null, FILTER_VALIDATE_INT);

        return ($valor === false || $valor < $minimo) ? $padrao : $valor;
    }

    public function corpo(string $chave, mixed $padrao = null): mixed
    {
        return $this->corpo[$chave] ?? $padrao;
    }

    /**
     * @return array<string, mixed>
     */
    public function corpoCompleto(): array
    {
        return $this->corpo;
    }

    public function cabecalho(string $chave): ?string
    {
        return $this->cabecalhos[strtolower($chave)] ?? null;
    }

    /**
     * @param array{id?: int, nome?: string, email?: string} $usuario
     */
    public function definirUsuario(array $usuario): void
    {
        $this->usuario = $usuario;
    }

    public function usuarioId(): int
    {
        return (int) ($this->usuario['id'] ?? 0);
    }

    public function usuarioNome(): string
    {
        return (string) ($this->usuario['nome'] ?? '');
    }

    /**
     * @return array<string, string>
     */
    private static function capturarCabecalhos(): array
    {
        $cabecalhos = [];

        foreach ($_SERVER as $chave => $valor) {
            if (str_starts_with((string) $chave, 'HTTP_')) {
                $nome = strtolower(str_replace('_', '-', substr((string) $chave, 5)));
                $cabecalhos[$nome] = (string) $valor;
            }
        }

        foreach (['CONTENT_TYPE', 'CONTENT_LENGTH', 'AUTHORIZATION'] as $chave) {
            if (isset($_SERVER[$chave])) {
                $nome = strtolower(str_replace('_', '-', $chave));
                $cabecalhos[$nome] = (string) $_SERVER[$chave];
            }
        }

        // Alguns rewrites do Apache renomeiam o header para
        // REDIRECT_HTTP_AUTHORIZATION; garante que o Bearer JWT chegue.
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) && !isset($cabecalhos['authorization'])) {
            $cabecalhos['authorization'] = (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        return $cabecalhos;
    }
}

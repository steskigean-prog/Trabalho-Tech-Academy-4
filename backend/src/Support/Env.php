<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Acesso a variáveis de ambiente.
 *
 * Ordem de resolução: variáveis do ambiente (docker-compose) e, como
 * alternativa para execução local sem Docker, um arquivo .env no raiz do
 * projeto ou dentro de backend/.
 *
 * Guardrail: quem escreve este código lê o .env, mas agentes de IA não devem
 * ler, imprimir ou expor o conteúdo de arquivos .env.
 */
final class Env
{
    /** @var array<string, string>|null cache do arquivo .env */
    private static ?array $arquivo = null;

    public static function obter(string $chave, ?string $padrao = null): ?string
    {
        $valor = getenv($chave);

        if ($valor !== false && $valor !== '') {
            return $valor;
        }

        if (self::$arquivo === null) {
            self::$arquivo = self::lerArquivo();
        }

        return self::$arquivo[$chave] ?? $padrao;
    }

    /**
     * @return array<string, string>
     */
    private static function lerArquivo(): array
    {
        $valores = [];

        // Raiz do projeto (útil ao rodar sem Docker) e backend/.env
        $candidatos = [
            dirname(__DIR__, 3) . '/.env',
            dirname(__DIR__, 2) . '/.env',
        ];

        foreach ($candidatos as $caminho) {
            if (!is_file($caminho) || !is_readable($caminho)) {
                continue;
            }

            $linhas = file($caminho, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

            foreach ($linhas as $linha) {
                $linha = trim($linha);

                if ($linha === '' || str_starts_with($linha, '#')) {
                    continue;
                }

                [$chave, $valor] = array_pad(explode('=', $linha, 2), 2, '');
                $valores[trim($chave)] = trim($valor);
            }
        }

        return $valores;
    }
}

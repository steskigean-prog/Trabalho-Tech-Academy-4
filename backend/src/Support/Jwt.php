<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Emissão e verificação de tokens JWT (HS256).
 *
 * Implementação autoral, sem dependências externas: base64url do cabeçalho e
 * do payload assinados com HMAC-SHA256 usando o segredo do ambiente.
 */
final class Jwt
{
    private const ALGORITMO = 'HS256';

    public function __construct(
        private readonly string $segredo,
        private readonly int $expiraEm
    ) {
    }

    /**
     * Emite um token assinado para o usuário informado.
     */
    public function emitir(int $usuarioId): string
    {
        $agora = time();

        $cabecalho = $this->base64Url((string) json_encode([
            'alg' => self::ALGORITMO,
            'typ' => 'JWT',
        ]));

        $payload = $this->base64Url((string) json_encode([
            'sub' => $usuarioId,
            'iat' => $agora,
            'exp' => $agora + $this->expiraEm,
        ]));

        $assinatura = $this->assinar("$cabecalho.$payload");

        return "$cabecalho.$payload.$assinatura";
    }

    /**
     * Verifica assinatura, algoritmo e expiração.
     *
     * @return array<string, mixed>|null payload válido ou null
     */
    public function verificar(string $token): ?array
    {
        $partes = explode('.', $token);

        if (count($partes) !== 3) {
            return null;
        }

        [$cabecalho, $payload, $assinatura] = $partes;

        if (!hash_equals($this->assinar("$cabecalho.$payload"), $assinatura)) {
            return null;
        }

        $dadosCabecalho = json_decode($this->base64UrlDecode($cabecalho), true);

        if (!is_array($dadosCabecalho) || ($dadosCabecalho['alg'] ?? null) !== self::ALGORITMO) {
            return null;
        }

        $claims = json_decode($this->base64UrlDecode($payload), true);

        if (!is_array($claims) || !isset($claims['exp']) || (int) $claims['exp'] < time()) {
            return null;
        }

        return $claims;
    }

    private function assinar(string $conteudo): string
    {
        return $this->base64Url(hash_hmac('sha256', $conteudo, $this->segredo, true));
    }

    private function base64Url(string $valor): string
    {
        return rtrim(strtr(base64_encode($valor), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $valor): string
    {
        $resto = strlen($valor) % 4;

        if ($resto !== 0) {
            $valor .= str_repeat('=', 4 - $resto);
        }

        $decodificado = base64_decode(strtr($valor, '-_', '+/'), true);

        return $decodificado === false ? '' : $decodificado;
    }
}

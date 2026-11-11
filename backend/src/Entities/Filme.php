<?php

declare(strict_types=1);

namespace App\Entities;

use App\Exceptions\ValidationException;
use App\Validators\ValidadorRegex;

/**
 * Filme do catálogo.
 *
 * Relacionamentos:
 * - Categoria (N:1) e Diretor (N:1) via chaves estrangeiras;
 * - Elenco (N:M com atores) materializado em filme_ator.
 */
final class Filme extends Entidade
{
    /** @var array<int, array{id: int, nome: string}> */
    private array $elenco = [];

    public function __construct(
        ?int $id,
        private string $titulo,
        private string $tituloOriginal,
        private int $ano,
        private int $categoriaId,
        private int $diretorId,
        private string $youtube,
        private string $capa,
        private string $sinopse,
        private ?string $categoriaNome = null,
        private ?string $diretorNome = null
    ) {
        parent::__construct($id);
    }

    public function titulo(): string
    {
        return $this->titulo;
    }

    public function definirTitulo(string $titulo): void
    {
        $titulo = trim($titulo);

        if (mb_strlen($titulo) < 3) {
            throw new ValidationException(['titulo' => 'O título deve ter ao menos 3 caracteres']);
        }

        $this->titulo = $titulo;
    }

    public function tituloOriginal(): string
    {
        return $this->tituloOriginal;
    }

    public function definirTituloOriginal(string $tituloOriginal): void
    {
        $tituloOriginal = trim($tituloOriginal);

        if (mb_strlen($tituloOriginal) < 2) {
            throw new ValidationException(['original' => 'Informe o título original']);
        }

        $this->tituloOriginal = $tituloOriginal;
    }

    public function ano(): int
    {
        return $this->ano;
    }

    public function definirAno(int $ano): void
    {
        if ($ano < 1895 || $ano > 2100) {
            throw new ValidationException(['ano' => 'Informe um ano entre 1895 e 2100']);
        }

        $this->ano = $ano;
    }

    public function categoriaId(): int
    {
        return $this->categoriaId;
    }

    public function definirCategoriaId(int $categoriaId): void
    {
        if ($categoriaId < 1) {
            throw new ValidationException(['categoria_id' => 'Selecione a categoria']);
        }

        $this->categoriaId = $categoriaId;
    }

    public function diretorId(): int
    {
        return $this->diretorId;
    }

    public function definirDiretorId(int $diretorId): void
    {
        if ($diretorId < 1) {
            throw new ValidationException(['diretor_id' => 'Selecione o diretor']);
        }

        $this->diretorId = $diretorId;
    }

    public function youtube(): string
    {
        return $this->youtube;
    }

    public function definirYoutube(string $youtube): void
    {
        $youtube = trim($youtube);

        if (!(new ValidadorRegex('/^[A-Za-z0-9_-]{11}$/', 'código'))->valido($youtube)) {
            throw new ValidationException(['youtube' => 'Informe o código do YouTube (11 caracteres)']);
        }

        $this->youtube = $youtube;
    }

    public function capa(): string
    {
        return $this->capa;
    }

    public function definirCapa(string $capa): void
    {
        $capa = trim($capa);

        if (!(new ValidadorRegex('#^(https?://|/)\S+$#', 'url'))->valido($capa)) {
            throw new ValidationException(['capa' => 'Informe a URL da capa (ex.: /arquivos/capa.jpg)']);
        }

        $this->capa = $capa;
    }

    public function sinopse(): string
    {
        return $this->sinopse;
    }

    public function definirSinopse(string $sinopse): void
    {
        $sinopse = trim($sinopse);

        if (mb_strlen($sinopse) < 10) {
            throw new ValidationException(['sinopse' => 'A sinopse deve ter ao menos 10 caracteres']);
        }

        $this->sinopse = $sinopse;
    }

    public function categoriaNome(): ?string
    {
        return $this->categoriaNome;
    }

    public function diretorNome(): ?string
    {
        return $this->diretorNome;
    }

    /**
     * @return array<int, array{id: int, nome: string}>
     */
    public function elenco(): array
    {
        return $this->elenco;
    }

    /**
     * @param array<int, array{id: int, nome: string}> $elenco
     */
    public function definirElenco(array $elenco): void
    {
        $this->elenco = $elenco;
    }

    /**
     * IDs do elenco para sincronizar a tabela filme_ator.
     *
     * @return array<int, int>
     */
    public function idsElenco(): array
    {
        return array_map(static fn (array $ator): int => (int) $ator['id'], $this->elenco);
    }

    /**
     * @return array<string, mixed>
     */
    public function paraArray(): array
    {
        return [
            'titulo' => $this->titulo,
            'original' => $this->tituloOriginal,
            'ano' => $this->ano,
            'categoria_id' => $this->categoriaId,
            'diretor_id' => $this->diretorId,
            'youtube' => $this->youtube,
            'capa' => $this->capa,
            'sinopse' => $this->sinopse,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function paraResposta(): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'original' => $this->tituloOriginal,
            'ano' => $this->ano,
            'categoria_id' => $this->categoriaId,
            'categoria_nome' => $this->categoriaNome,
            'diretor_id' => $this->diretorId,
            'diretor_nome' => $this->diretorNome,
            'youtube' => $this->youtube,
            'capa' => $this->capa,
            'sinopse' => $this->sinopse,
            'elenco' => $this->elenco,
        ];
    }
}

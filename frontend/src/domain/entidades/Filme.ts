import type { DadosElenco, DadosFilme } from '../../tipos';
import { ErroValidacao } from '../excecoes/ErroValidacao';
import { ValidadorAno } from '../validadores/ValidadorAno';
import { ValidadorRegex } from '../validadores/ValidadorRegex';
import { ValidadorTamanhoMinimo } from '../validadores/ValidadorTamanhoMinimo';
import { Entidade } from './Entidade';

/**
 * Filme do catálogo.
 *
 * Setters com validação de regra de negócio: construir/editar um Filme
 * inválido lança ErroValidacao com os campos problemáticos.
 */
export class Filme extends Entidade {
  #titulo: string;
  #tituloOriginal: string;
  #ano: number;
  #categoriaId: number;
  #diretorId: number;
  #youtube: string;
  #capa: string;
  #sinopse: string;
  readonly #categoriaNome: string | null;
  readonly #diretorNome: string | null;
  #elenco: DadosElenco[];

  constructor(dados: DadosFilme) {
    super(dados.id);
    this.#titulo = dados.titulo;
    this.#tituloOriginal = dados.original;
    this.#ano = dados.ano;
    this.#categoriaId = dados.categoria_id;
    this.#diretorId = dados.diretor_id;
    this.#youtube = dados.youtube;
    this.#capa = dados.capa;
    this.#sinopse = dados.sinopse;
    this.#categoriaNome = dados.categoria_nome;
    this.#diretorNome = dados.diretor_nome;
    this.#elenco = dados.elenco;
  }

  get titulo(): string {
    return this.#titulo;
  }

  set titulo(valor: string) {
    if (!new ValidadorTamanhoMinimo(3).validar(valor)) {
      throw new ErroValidacao({ titulo: 'O título deve ter ao menos 3 caracteres' });
    }

    this.#titulo = valor.trim();
  }

  get tituloOriginal(): string {
    return this.#tituloOriginal;
  }

  set tituloOriginal(valor: string) {
    if (!new ValidadorTamanhoMinimo(2).validar(valor)) {
      throw new ErroValidacao({ original: 'Informe o título original' });
    }

    this.#tituloOriginal = valor.trim();
  }

  get ano(): number {
    return this.#ano;
  }

  set ano(valor: number) {
    if (!new ValidadorAno().validar(valor)) {
      throw new ErroValidacao({ ano: 'Informe um ano entre 1895 e 2100' });
    }

    this.#ano = valor;
  }

  get categoriaId(): number {
    return this.#categoriaId;
  }

  set categoriaId(valor: number) {
    if (!Number.isInteger(valor) || valor < 1) {
      throw new ErroValidacao({ categoria_id: 'Selecione a categoria' });
    }

    this.#categoriaId = valor;
  }

  get diretorId(): number {
    return this.#diretorId;
  }

  set diretorId(valor: number) {
    if (!Number.isInteger(valor) || valor < 1) {
      throw new ErroValidacao({ diretor_id: 'Selecione o diretor' });
    }

    this.#diretorId = valor;
  }

  get youtube(): string {
    return this.#youtube;
  }

  set youtube(valor: string) {
    if (!new ValidadorRegex(/^[A-Za-z0-9_-]{11}$/, 'código').validar(valor)) {
      throw new ErroValidacao({ youtube: 'Informe o código do YouTube (11 caracteres)' });
    }

    this.#youtube = valor.trim();
  }

  get capa(): string {
    return this.#capa;
  }

  set capa(valor: string) {
    if (!new ValidadorRegex(/^(https?:\/\/|\/)\S+$/, 'url').validar(valor)) {
      throw new ErroValidacao({ capa: 'Informe a URL da capa (ex.: /arquivos/capa.jpg)' });
    }

    this.#capa = valor.trim();
  }

  get sinopse(): string {
    return this.#sinopse;
  }

  set sinopse(valor: string) {
    if (!new ValidadorTamanhoMinimo(10).validar(valor)) {
      throw new ErroValidacao({ sinopse: 'A sinopse deve ter ao menos 10 caracteres' });
    }

    this.#sinopse = valor.trim();
  }

  get categoriaNome(): string | null {
    return this.#categoriaNome;
  }

  get diretorNome(): string | null {
    return this.#diretorNome;
  }

  /** Elenco (somente leitura para componentes de exibição). */
  get elenco(): readonly DadosElenco[] {
    return this.#elenco;
  }

  /**
   * Substitui o elenco por ids (vindo do formulário) preservando nomes
   * conhecidos quando possível.
   */
  definirElencoPorIds(ids: number[], nomesConhecidos: Map<number, string>): void {
    this.#elenco = ids.map((id) => ({ id, nome: nomesConhecidos.get(id) ?? '' }));
  }

  paraJSON(): Record<string, unknown> {
    return {
      titulo: this.#titulo,
      original: this.#tituloOriginal,
      ano: this.#ano,
      categoria_id: this.#categoriaId,
      diretor_id: this.#diretorId,
      youtube: this.#youtube,
      capa: this.#capa,
      sinopse: this.#sinopse,
      elenco: this.#elenco.map((ator) => ator.id),
    };
  }
}

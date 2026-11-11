import type { DadosPessoa } from '../../tipos';
import { ErroValidacao } from '../excecoes/ErroValidacao';
import { ValidadorTamanhoMinimo } from '../validadores/ValidadorTamanhoMinimo';
import { Entidade } from './Entidade';

/**
 * Base para pessoas do catálogo (atores e diretores).
 *
 * Herança legítima: campos e regras idênticos; o polimorfismo aparece em
 * papel(), sobrescrito por cada subclasse.
 */
export abstract class Pessoa extends Entidade {
  #nome: string;
  #nacionalidade: string;

  protected constructor(id: number | null, nome: string, nacionalidade: string) {
    super(id);
    this.#nome = nome;
    this.#nacionalidade = nacionalidade;
  }

  abstract get papel(): string;

  get nome(): string {
    return this.#nome;
  }

  set nome(valor: string) {
    if (!new ValidadorTamanhoMinimo(3).validar(valor)) {
      throw new ErroValidacao({ nome: 'O nome deve ter ao menos 3 caracteres' });
    }

    this.#nome = valor.trim();
  }

  get nacionalidade(): string {
    return this.#nacionalidade;
  }

  set nacionalidade(valor: string) {
    if (!new ValidadorTamanhoMinimo(3).validar(valor)) {
      throw new ErroValidacao({ nacionalidade: 'A nacionalidade deve ter ao menos 3 caracteres' });
    }

    this.#nacionalidade = valor.trim();
  }

  paraJSON(): Record<string, unknown> {
    return {
      nome: this.#nome,
      nacionalidade: this.#nacionalidade,
    };
  }
}

/** Ator/atriz do elenco (N:M com filme). */
export class Ator extends Pessoa {
  constructor(dados: DadosPessoa) {
    super(dados.id, dados.nome, dados.nacionalidade);
  }

  get papel(): string {
    return 'Ator/Atriz';
  }
}

/** Diretor de filmes (1:N com filme). */
export class Diretor extends Pessoa {
  constructor(dados: DadosPessoa) {
    super(dados.id, dados.nome, dados.nacionalidade);
  }

  get papel(): string {
    return 'Direção';
  }
}

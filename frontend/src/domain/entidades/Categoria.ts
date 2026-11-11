import type { DadosCategoria } from '../../tipos';
import { ErroValidacao } from '../excecoes/ErroValidacao';
import { ValidadorTamanhoMinimo } from '../validadores/ValidadorTamanhoMinimo';
import { Entidade } from './Entidade';

/** Categoria (gênero) de filme. */
export class Categoria extends Entidade {
  #nome: string;

  constructor(dados: DadosCategoria) {
    super(dados.id);
    this.#nome = dados.categoria;
  }

  get nome(): string {
    return this.#nome;
  }

  set nome(valor: string) {
    if (!new ValidadorTamanhoMinimo(2).validar(valor)) {
      throw new ErroValidacao({ categoria: 'A categoria deve ter ao menos 2 caracteres' });
    }

    this.#nome = valor.trim();
  }

  paraJSON(): Record<string, unknown> {
    return { categoria: this.#nome };
  }
}

import { Validador } from './Validador';

/** Validador genérico por expressão regular. */
export class ValidadorRegex extends Validador {
  readonly #padrao: RegExp;

  constructor(padrao: RegExp, mensagem: string) {
    super(mensagem);
    this.#padrao = padrao;
  }

  validar(valor: unknown): boolean {
    return typeof valor === 'string' && this.#padrao.test(valor.trim());
  }
}

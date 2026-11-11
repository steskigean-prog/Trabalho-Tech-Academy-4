import { Validador } from './Validador';

/** Tamanho mínimo de caracteres (descontando espaços nas pontas). */
export class ValidadorTamanhoMinimo extends Validador {
  readonly #minimo: number;

  constructor(minimo: number, mensagem?: string) {
    super(mensagem ?? `Informe ao menos ${minimo} caracteres`);
    this.#minimo = minimo;
  }

  validar(valor: unknown): boolean {
    return typeof valor === 'string' && valor.trim().length >= this.#minimo;
  }
}

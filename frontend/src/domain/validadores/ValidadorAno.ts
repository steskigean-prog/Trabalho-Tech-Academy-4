import { Validador } from './Validador';

/** Ano de lançamento plausível (entre 1895 e 2100). */
export class ValidadorAno extends Validador {
  constructor(mensagem = 'Informe um ano entre 1895 e 2100') {
    super(mensagem);
  }

  validar(valor: unknown): boolean {
    const ano = Number(valor);

    return Number.isInteger(ano) && ano >= 1895 && ano <= 2100;
  }
}

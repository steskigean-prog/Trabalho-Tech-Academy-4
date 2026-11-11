import { Validador } from './Validador';

/** E-mail validado por expressão regular (mesma regra do backend). */
export class ValidadorEmail extends Validador {
  static readonly PADRAO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(mensagem = 'Informe um e-mail válido') {
    super(mensagem);
  }

  validar(valor: unknown): boolean {
    return typeof valor === 'string' && ValidadorEmail.PADRAO.test(valor.trim());
  }
}

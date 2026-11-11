import { Validador } from './Validador';

/** Campo obrigatório: não nulo, não vazio, não apenas espaços. */
export class ValidadorObrigatorio extends Validador {
  constructor(mensagem = 'Preencha este campo') {
    super(mensagem);
  }

  validar(valor: unknown): boolean {
    if (valor === null || valor === undefined) {
      return false;
    }

    if (typeof valor === 'string') {
      return valor.trim() !== '';
    }

    if (Array.isArray(valor)) {
      return valor.length > 0;
    }

    return true;
  }
}

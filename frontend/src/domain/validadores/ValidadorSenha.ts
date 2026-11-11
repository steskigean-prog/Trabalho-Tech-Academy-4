import { Validador } from './Validador';

/**
 * Nível de senha exigido (mesma regra do backend):
 * mínimo de 8 caracteres com maiúscula, minúscula e número.
 */
export class ValidadorSenha extends Validador {
  constructor(
    mensagem = 'A senha deve ter ao menos 8 caracteres, com uma maiúscula, uma minúscula e um número',
  ) {
    super(mensagem);
  }

  validar(valor: unknown): boolean {
    if (typeof valor !== 'string') {
      return false;
    }

    return (
      valor.length >= 8 &&
      /[A-Z]/.test(valor) &&
      /[a-z]/.test(valor) &&
      /\d/.test(valor)
    );
  }
}

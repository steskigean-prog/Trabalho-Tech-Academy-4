import { Validador } from './Validador';

/**
 * CPF com dígitos verificadores (mesma regra do backend).
 * Aceita com ou sem máscara: apenas os 11 dígitos são considerados.
 */
export class ValidadorCpf extends Validador {
  constructor(mensagem = 'Informe um CPF válido') {
    super(mensagem);
  }

  validar(valor: unknown): boolean {
    if (typeof valor !== 'string') {
      return false;
    }

    const cpf = valor.replace(/\D/g, '');

    if (cpf.length !== 11) {
      return false;
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    for (let posicao = 9; posicao < 11; posicao++) {
      let soma = 0;

      for (let indice = 0; indice < posicao; indice++) {
        soma += Number(cpf[indice]) * ((posicao + 1) - indice);
      }

      const digito = ((10 * soma) % 11) % 10;

      if (Number(cpf[posicao]) !== digito) {
        return false;
      }
    }

    return true;
  }
}

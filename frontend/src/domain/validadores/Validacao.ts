import type { Validador } from './Validador';

/** Uma regra a ser avaliada pela validação em lote. */
export interface RegraValidacao {
  campo: string;
  valor: unknown;
  validadores: Validador[];
}

/**
 * Executa o conjunto de regras e acumula os erros por campo.
 *
 * Retorna um mapa { campo: mensagem } — vazio quando tudo é válido.
 * O mesmo contrato é usado por todas as telas, centralizando a validação
 * do frontend.
 */
export class Validacao {
  static executar(regras: RegraValidacao[]): Record<string, string> {
    const erros: Record<string, string> = {};

    for (const regra of regras) {
      for (const validador of regra.validadores) {
        if (!validador.validar(regra.valor)) {
          erros[regra.campo] = validador.mensagem;
          break;
        }
      }
    }

    return erros;
  }

  static temErros(erros: Record<string, string>): boolean {
    return Object.keys(erros).length > 0;
  }
}

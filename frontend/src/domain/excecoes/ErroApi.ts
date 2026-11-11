import { ErroAplicacao } from './ErroAplicacao';

/**
 * Erro retornado pela API (status HTTP + mensagem + detalhes por campo).
 */
export class ErroApi extends ErroAplicacao {
  constructor(
    mensagem: string,
    public readonly status: number,
    public readonly detalhes?: Record<string, string>,
  ) {
    super(mensagem);
  }
}

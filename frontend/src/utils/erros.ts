import { ErroApi } from '../domain/excecoes/ErroApi';
import { ErroAplicacao } from '../domain/excecoes/ErroAplicacao';

/** Mensagem amigável para qualquer erro lançado pela aplicação. */
export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    return erro.message;
  }

  if (erro instanceof ErroAplicacao) {
    return erro.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

/** Detalhes por campo vindos da API (quando existirem). */
export function detalhesDoErro(erro: unknown): Record<string, string> {
  return erro instanceof ErroApi ? (erro.detalhes ?? {}) : {};
}

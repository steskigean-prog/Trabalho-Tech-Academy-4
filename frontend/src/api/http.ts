import { ErroApi } from '../domain/excecoes/ErroApi';
import type { RespostaErro } from '../tipos';

const CHAVE_TOKEN = 'imdb.token';

/**
 * Token JWT persistido no localStorage (exigência da rubrica de
 * autenticação do frontend).
 */
export const armazenamentoToken = {
  obter(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  },

  salvar(token: string): void {
    localStorage.setItem(CHAVE_TOKEN, token);
  },

  limpar(): void {
    localStorage.removeItem(CHAVE_TOKEN);
  },
};

/**
 * Cliente HTTP do frontend.
 *
 * Injeta o token Bearer nas requisições, converte respostas de erro em
 * ErroApi (com mensagem amigável) e, ao receber 401 com token expirado,
 * limpa a sessão e volta para a tela de login.
 */
class ClienteHttp {
  async get<T>(caminho: string): Promise<T> {
    return this.requisicao<T>('GET', caminho);
  }

  async post<T>(caminho: string, corpo?: unknown): Promise<T> {
    return this.requisicao<T>('POST', caminho, corpo);
  }

  async put<T>(caminho: string, corpo?: unknown): Promise<T> {
    return this.requisicao<T>('PUT', caminho, corpo);
  }

  async delete<T>(caminho: string): Promise<T> {
    return this.requisicao<T>('DELETE', caminho);
  }

  private async requisicao<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
    const token = armazenamentoToken.obter();

    const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };

    if (token !== null) {
      cabecalhos.Authorization = `Bearer ${token}`;
    }

    let resposta: Response;

    try {
      resposta = await fetch(`/api${caminho}`, {
        method: metodo,
        headers: cabecalhos,
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      });
    } catch {
      throw new ErroApi('Não foi possível conectar ao servidor. Tente novamente em instantes.', 0);
    }

    if (!resposta.ok) {
      throw await this.tratarErro(resposta);
    }

    if (resposta.status === 204) {
      return undefined as T;
    }

    return (await resposta.json()) as T;
  }

  private async tratarErro(resposta: Response): Promise<ErroApi> {
    let mensagem = 'Erro inesperado. Tente novamente.';
    let detalhes: Record<string, string> | undefined;

    try {
      const corpo = (await resposta.json()) as RespostaErro;

      if (corpo.erro !== undefined) {
        mensagem = corpo.erro;
      }

      detalhes = corpo.detalhes;
    } catch {
      // resposta sem corpo em JSON: mantém a mensagem padrão
    }

    // Token presente + 401 em rota protegida = sessão expirada
    if (resposta.status === 401 && armazenamentoToken.obter() !== null) {
      armazenamentoToken.limpar();

      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return new ErroApi(mensagem, resposta.status, detalhes);
  }
}

export const http = new ClienteHttp();

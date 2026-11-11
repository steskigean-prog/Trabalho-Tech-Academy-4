import { http } from '../../api/http';
import type { ResultadoPaginado } from '../../tipos';
import type { Entidade } from '../entidades/Entidade';

/**
 * Contrato de persistência de recursos da API.
 *
 * A interface desacopla as telas do transporte concreto (open/closed):
 * novas fontes podem implementar o mesmo contrato.
 */
export interface Repositorio<T extends Entidade> {
  listar(pagina: number, limite: number): Promise<ResultadoPaginado<T>>;
  buscar(id: number): Promise<T>;
  criar(entidade: T): Promise<T>;
  atualizar(id: number, entidade: T): Promise<T>;
  excluir(id: number): Promise<void>;
}

/** Dados crus vindos da API. */
export type DadosApi = Record<string, unknown>;

/** Função que converte dados da API na entidade do domínio. */
export type Hidratador<T> = (dados: DadosApi) => T;

/**
 * Implementação genérica sobre a API REST.
 *
 * O parâmetro de tipo T permite reutilizar toda a lógica de CRUD para
 * qualquer entidade (categorias, filmes, atores, diretores...).
 */
export class RepositorioApi<T extends Entidade> implements Repositorio<T> {
  constructor(
    private readonly recurso: string,
    private readonly hidratar: Hidratador<T>,
  ) {}

  async listar(pagina = 1, limite = 10): Promise<ResultadoPaginado<T>> {
    const resultado = await http.get<ResultadoPaginado<DadosApi>>(
      `/${this.recurso}?pagina=${pagina}&limite=${limite}`,
    );

    return {
      data: resultado.data.map((dados) => this.hidratar(dados)),
      meta: resultado.meta,
    };
  }

  async buscar(id: number): Promise<T> {
    return this.hidratar(await http.get<DadosApi>(`/${this.recurso}/${id}`));
  }

  async criar(entidade: T): Promise<T> {
    return this.hidratar(await http.post<DadosApi>(`/${this.recurso}`, entidade.paraJSON()));
  }

  async atualizar(id: number, entidade: T): Promise<T> {
    return this.hidratar(await http.put<DadosApi>(`/${this.recurso}/${id}`, entidade.paraJSON()));
  }

  async excluir(id: number): Promise<void> {
    await http.delete(`/${this.recurso}/${id}`);
  }
}

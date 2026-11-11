import type { ResultadoPaginado } from '../../tipos';
import type { Entidade } from '../entidades/Entidade';
import type { Repositorio } from '../repositorios/RepositorioApi';

/**
 * Serviço genérico de CRUD sobre um repositório.
 *
 * Centraliza as operações comuns às telas de manutenção, incluindo a regra
 * salvar = atualizar quando há id, criar quando não há.
 */
export class ServicoCrud<T extends Entidade> {
  constructor(private readonly repositorio: Repositorio<T>) {}

  listar(pagina = 1, limite = 10): Promise<ResultadoPaginado<T>> {
    return this.repositorio.listar(pagina, limite);
  }

  buscar(id: number): Promise<T> {
    return this.repositorio.buscar(id);
  }

  salvar(entidade: T): Promise<T> {
    return entidade.id === null
      ? this.repositorio.criar(entidade)
      : this.repositorio.atualizar(entidade.id, entidade);
  }

  async excluir(id: number): Promise<void> {
    await this.repositorio.excluir(id);
  }
}

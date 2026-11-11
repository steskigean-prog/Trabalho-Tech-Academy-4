import type { DadosCategoria, DadosFilme, DadosPessoa } from '../../tipos';
import { Ator, Diretor } from '../entidades/Pessoa';
import { Categoria } from '../entidades/Categoria';
import { Filme } from '../entidades/Filme';
import { RepositorioApi } from '../repositorios/RepositorioApi';
import { ServicoCrud } from './ServicoCrud';

/**
 * Instâncias prontas dos repositórios/serviços de cada recurso.
 *
 * O mesmo RepositorioApi genérico atende todos os recursos do catálogo,
 * variando apenas a entidade hidratada.
 */

export const repositorioCategorias = new RepositorioApi<Categoria>(
  'categorias',
  (dados) => new Categoria(dados as unknown as DadosCategoria),
);

export const repositorioAtores = new RepositorioApi<Ator>(
  'atores',
  (dados) => new Ator(dados as unknown as DadosPessoa),
);

export const repositorioDiretores = new RepositorioApi<Diretor>(
  'diretores',
  (dados) => new Diretor(dados as unknown as DadosPessoa),
);

export const repositorioFilmes = new RepositorioApi<Filme>(
  'filmes',
  (dados) => new Filme(dados as unknown as DadosFilme),
);

export const servicoCategorias = new ServicoCrud(repositorioCategorias);
export const servicoAtores = new ServicoCrud(repositorioAtores);
export const servicoDiretores = new ServicoCrud(repositorioDiretores);
export const servicoFilmes = new ServicoCrud(repositorioFilmes);

/**
 * Contratos de dados trocados com a API (respostas JSON em snake_case,
 * refletindo as colunas do banco de dados).
 */

export interface RespostaErro {
  erro?: string;
  codigo?: number;
  detalhes?: Record<string, string>;
}

export interface MetaPaginacao {
  pagina: number;
  limite: number;
  total: number;
  paginas: number;
}

export interface ResultadoPaginado<T> {
  data: T[];
  meta: MetaPaginacao;
}

export interface DadosUsuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  ativo: boolean;
}

export interface RespostaLogin {
  token: string;
  usuario: DadosUsuario;
}

export interface DadosCategoria {
  id: number;
  categoria: string;
}

export interface DadosPessoa {
  id: number;
  nome: string;
  nacionalidade: string;
  papel: string;
}

export interface DadosElenco {
  id: number;
  nome: string;
}

export interface DadosFilme {
  id: number;
  titulo: string;
  original: string;
  ano: number;
  categoria_id: number;
  categoria_nome: string;
  diretor_id: number;
  diretor_nome: string;
  youtube: string;
  capa: string;
  sinopse: string;
  elenco: DadosElenco[];
}

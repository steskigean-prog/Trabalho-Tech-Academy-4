import { type ReactNode } from 'react';
import { Carregando } from './Carregando';

export interface Coluna<T> {
  titulo: string;
  render: (item: T) => ReactNode;
  largura?: string;
}

interface PropsTabela<T> {
  colunas: Coluna<T>[];
  dados: T[];
  carregando?: boolean;
  mensagemVazio?: string;
}

/**
 * Tabela de dados genérica: recebe colunas com funções de renderização e
 * funciona para qualquer entidade do sistema.
 */
export function Tabela<T>({
  colunas,
  dados,
  carregando = false,
  mensagemVazio = 'Nenhum registro encontrado',
}: PropsTabela<T>) {
  if (carregando) {
    return (
      <div className="tabela__carregando">
        <Carregando />
      </div>
    );
  }

  return (
    <div className="tabela__rolagem">
      <table className="tabela">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.titulo} style={coluna.largura ? { width: coluna.largura } : undefined}>
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="tabela__vazio">
                {mensagemVazio}
              </td>
            </tr>
          ) : (
            dados.map((item, indice) => (
              <tr key={indice}>
                {colunas.map((coluna) => (
                  <td key={coluna.titulo}>{coluna.render(item)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

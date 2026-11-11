import { useCallback, useEffect, useState } from 'react';
import type { MetaPaginacao } from '../tipos';
import type { Entidade } from '../domain/entidades/Entidade';
import type { ServicoCrud } from '../domain/servicos/ServicoCrud';
import { mensagemDoErro } from '../utils/erros';

interface RetornoListagem<T extends Entidade> {
  itens: T[];
  meta: MetaPaginacao;
  carregando: boolean;
  erro: string | null;
  pagina: number;
  irParaPagina: (pagina: number) => void;
  excluir: (id: number) => Promise<void>;
  recarregar: () => void;
}

/**
 * Lógica reutilizável das telas de listagem: paginação, carregamento e erro.
 *
 * Qualquer página de CRUD usa este hook com o serviço correspondente,
 * evitando duplicar o controle de estado em cada listagem.
 */
export function useListagem<T extends Entidade>(
  servico: ServicoCrud<T>,
  limite = 10,
): RetornoListagem<T> {
  const [itens, setItens] = useState<T[]>([]);
  const [meta, setMeta] = useState<MetaPaginacao>({ pagina: 1, limite, total: 0, paginas: 1 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);

  const carregar = useCallback(
    async (paginaDesejada: number) => {
      setCarregando(true);
      setErro(null);

      try {
        const resultado = await servico.listar(paginaDesejada, limite);
        setItens(resultado.data);
        setMeta(resultado.meta);
      } catch (excecao) {
        setErro(mensagemDoErro(excecao));
      } finally {
        setCarregando(false);
      }
    },
    [servico, limite],
  );

  useEffect(() => {
    void carregar(pagina);
  }, [pagina, carregar]);

  const irParaPagina = useCallback((novaPagina: number) => {
    setPagina(novaPagina);
  }, []);

  const excluir = useCallback(
    async (id: number): Promise<void> => {
      try {
        await servico.excluir(id);
      } catch (excecao) {
        setErro(mensagemDoErro(excecao));
        return;
      }

      // Ao remover o último item de uma página, volta para a anterior
      if (itens.length === 1 && pagina > 1) {
        setPagina(pagina - 1);
        return;
      }

      await carregar(pagina);
    },
    [servico, itens.length, pagina, carregar],
  );

  const recarregar = useCallback(() => {
    void carregar(pagina);
  }, [pagina, carregar]);

  return { itens, meta, carregando, erro, pagina, irParaPagina, excluir, recarregar };
}

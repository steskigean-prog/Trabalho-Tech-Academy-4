import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AcoesRegistro } from '../components/ui/AcoesRegistro';
import { Alerta } from '../components/ui/Alerta';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { Cartao } from '../components/ui/Cartao';
import { Confirmacao } from '../components/ui/Confirmacao';
import { Paginacao } from '../components/ui/Paginacao';
import { Tabela, type Coluna } from '../components/ui/Tabela';
import type { Categoria } from '../domain/entidades/Categoria';
import { servicoCategorias } from '../domain/servicos/recursos';
import { useListagem } from '../hooks/useListagem';

export function CategoriasPage() {
  const { itens, meta, carregando, erro, pagina, irParaPagina, excluir } =
    useListagem(servicoCategorias);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);

  async function confirmarExclusao(): Promise<void> {
    if (idParaExcluir === null) {
      return;
    }

    // O hook trata erros (404/409) e recarrega a listagem
    await excluir(idParaExcluir);
    setIdParaExcluir(null);
  }

  const colunas: Coluna<Categoria>[] = [
    { titulo: 'ID', largura: '80px', render: (categoria) => categoria.id },
    { titulo: 'Categoria', render: (categoria) => categoria.nome },
    {
      titulo: 'Opções',
      largura: '220px',
      render: (categoria) => (
        <AcoesRegistro
          rotaEditar={`/categorias/${categoria.id ?? 0}/editar`}
          aoExcluir={() => setIdParaExcluir(categoria.id ?? 0)}
          rotulo={categoria.nome}
        />
      ),
    },
  ];

  return (
    <>
      <CabecalhoPagina
        titulo="Categorias"
        descricao="Gêneros que classificam os filmes do catálogo (relacionamento N:1)."
        acoes={
          <Link to="/categorias/novo" className="btn btn-primario">
            + Nova categoria
          </Link>
        }
      />

      {erro !== null ? <Alerta tipo="erro" mensagem={erro} /> : null}

      <Cartao>
        <Tabela
          colunas={colunas}
          dados={itens}
          carregando={carregando}
          mensagemVazio="Nenhuma categoria cadastrada"
        />
        <Paginacao pagina={pagina} totalPaginas={meta.paginas} aoMudar={irParaPagina} />
      </Cartao>

      <Confirmacao
        aberto={idParaExcluir !== null}
        titulo="Excluir categoria"
        mensagem="Esta ação não pode ser desfeita. Categorias com filmes vinculados não podem ser excluídas."
        aoConfirmar={() => void confirmarExclusao()}
        aoCancelar={() => setIdParaExcluir(null)}
      />
    </>
  );
}

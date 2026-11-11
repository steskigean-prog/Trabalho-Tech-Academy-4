import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AcoesRegistro } from '../components/ui/AcoesRegistro';
import { Alerta } from '../components/ui/Alerta';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { Cartao } from '../components/ui/Cartao';
import { Confirmacao } from '../components/ui/Confirmacao';
import { Paginacao } from '../components/ui/Paginacao';
import { Tabela, type Coluna } from '../components/ui/Tabela';
import type { Filme } from '../domain/entidades/Filme';
import { servicoFilmes } from '../domain/servicos/recursos';
import { useListagem } from '../hooks/useListagem';

/** Miniatura da capa exibida na listagem — componente exclusivo desta página. */
function CapaDoFilme({ filme }: { filme: Filme }) {
  return (
    <img
      src={filme.capa}
      alt={`Capa do filme ${filme.titulo}`}
      className="capa-miniatura"
      loading="lazy"
    />
  );
}

export function FilmesPage() {
  const { itens, meta, carregando, erro, pagina, irParaPagina, excluir } =
    useListagem(servicoFilmes);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);

  async function confirmarExclusao(): Promise<void> {
    if (idParaExcluir === null) {
      return;
    }

    await excluir(idParaExcluir);
    setIdParaExcluir(null);
  }

  const colunas: Coluna<Filme>[] = [
    { titulo: 'Capa', largura: '90px', render: (filme) => <CapaDoFilme filme={filme} /> },
    { titulo: 'Título', render: (filme) => <strong>{filme.titulo}</strong> },
    { titulo: 'Ano', largura: '80px', render: (filme) => filme.ano },
    { titulo: 'Categoria', render: (filme) => filme.categoriaNome ?? '—' },
    { titulo: 'Direção', render: (filme) => filme.diretorNome ?? '—' },
    {
      titulo: 'Opções',
      largura: '220px',
      render: (filme) => (
        <AcoesRegistro
          rotaEditar={`/filmes/${filme.id ?? 0}/editar`}
          aoExcluir={() => setIdParaExcluir(filme.id ?? 0)}
          rotulo={filme.titulo}
        />
      ),
    },
  ];

  return (
    <>
      <CabecalhoPagina
        titulo="Filmes"
        descricao="Catálogo completo: capa, sinopse, categoria, direção e elenco."
        acoes={
          <Link to="/filmes/novo" className="btn btn-primario">
            + Novo filme
          </Link>
        }
      />

      {erro !== null ? <Alerta tipo="erro" mensagem={erro} /> : null}

      <Cartao>
        <Tabela
          colunas={colunas}
          dados={itens}
          carregando={carregando}
          mensagemVazio="Nenhum filme cadastrado"
        />
        <Paginacao pagina={pagina} totalPaginas={meta.paginas} aoMudar={irParaPagina} />
      </Cartao>

      <Confirmacao
        aberto={idParaExcluir !== null}
        titulo="Excluir filme"
        mensagem="Esta ação não pode ser desfeita e remove também os vínculos de elenco do filme."
        aoConfirmar={() => void confirmarExclusao()}
        aoCancelar={() => setIdParaExcluir(null)}
      />
    </>
  );
}

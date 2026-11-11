import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AcoesRegistro } from '../components/ui/AcoesRegistro';
import { Alerta } from '../components/ui/Alerta';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { Cartao } from '../components/ui/Cartao';
import { Confirmacao } from '../components/ui/Confirmacao';
import { Paginacao } from '../components/ui/Paginacao';
import { Tabela, type Coluna } from '../components/ui/Tabela';
import type { Diretor } from '../domain/entidades/Pessoa';
import { servicoDiretores } from '../domain/servicos/recursos';
import { useListagem } from '../hooks/useListagem';

export function DiretoresPage() {
  const { itens, meta, carregando, erro, pagina, irParaPagina, excluir } =
    useListagem(servicoDiretores);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);

  async function confirmarExclusao(): Promise<void> {
    if (idParaExcluir === null) {
      return;
    }

    await excluir(idParaExcluir);
    setIdParaExcluir(null);
  }

  const colunas: Coluna<Diretor>[] = [
    { titulo: 'ID', largura: '80px', render: (diretor) => diretor.id },
    { titulo: 'Nome', render: (diretor) => diretor.nome },
    { titulo: 'Nacionalidade', render: (diretor) => diretor.nacionalidade },
    { titulo: 'Papel', render: (diretor) => diretor.papel },
    {
      titulo: 'Opções',
      largura: '220px',
      render: (diretor) => (
        <AcoesRegistro
          rotaEditar={`/diretores/${diretor.id ?? 0}/editar`}
          aoExcluir={() => setIdParaExcluir(diretor.id ?? 0)}
          rotulo={diretor.nome}
        />
      ),
    },
  ];

  return (
    <>
      <CabecalhoPagina
        titulo="Diretores"
        descricao="Direção dos filmes do catálogo (relacionamento N:1)."
        acoes={
          <Link to="/diretores/novo" className="btn btn-primario">
            + Novo diretor
          </Link>
        }
      />

      {erro !== null ? <Alerta tipo="erro" mensagem={erro} /> : null}

      <Cartao>
        <Tabela
          colunas={colunas}
          dados={itens}
          carregando={carregando}
          mensagemVazio="Nenhum diretor cadastrado"
        />
        <Paginacao pagina={pagina} totalPaginas={meta.paginas} aoMudar={irParaPagina} />
      </Cartao>

      <Confirmacao
        aberto={idParaExcluir !== null}
        titulo="Excluir diretor"
        mensagem="Esta ação não pode ser desfeita. Diretores com filmes vinculados não podem ser excluídos."
        aoConfirmar={() => void confirmarExclusao()}
        aoCancelar={() => setIdParaExcluir(null)}
      />
    </>
  );
}

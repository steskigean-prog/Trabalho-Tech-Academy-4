import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AcoesRegistro } from '../components/ui/AcoesRegistro';
import { Alerta } from '../components/ui/Alerta';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { Cartao } from '../components/ui/Cartao';
import { Confirmacao } from '../components/ui/Confirmacao';
import { Paginacao } from '../components/ui/Paginacao';
import { Tabela, type Coluna } from '../components/ui/Tabela';
import type { Ator } from '../domain/entidades/Pessoa';
import { servicoAtores } from '../domain/servicos/recursos';
import { useListagem } from '../hooks/useListagem';

export function AtoresPage() {
  const { itens, meta, carregando, erro, pagina, irParaPagina, excluir } =
    useListagem(servicoAtores);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);

  async function confirmarExclusao(): Promise<void> {
    if (idParaExcluir === null) {
      return;
    }

    await excluir(idParaExcluir);
    setIdParaExcluir(null);
  }

  const colunas: Coluna<Ator>[] = [
    { titulo: 'ID', largura: '80px', render: (ator) => ator.id },
    { titulo: 'Nome', render: (ator) => ator.nome },
    { titulo: 'Nacionalidade', render: (ator) => ator.nacionalidade },
    { titulo: 'Papel', render: (ator) => ator.papel },
    {
      titulo: 'Opções',
      largura: '220px',
      render: (ator) => (
        <AcoesRegistro
          rotaEditar={`/atores/${ator.id ?? 0}/editar`}
          aoExcluir={() => setIdParaExcluir(ator.id ?? 0)}
          rotulo={ator.nome}
        />
      ),
    },
  ];

  return (
    <>
      <CabecalhoPagina
        titulo="Atores"
        descricao="Elenco disponível para compor os filmes do catálogo (relacionamento N:M)."
        acoes={
          <Link to="/atores/novo" className="btn btn-primario">
            + Novo ator
          </Link>
        }
      />

      {erro !== null ? <Alerta tipo="erro" mensagem={erro} /> : null}

      <Cartao>
        <Tabela
          colunas={colunas}
          dados={itens}
          carregando={carregando}
          mensagemVazio="Nenhum ator cadastrado"
        />
        <Paginacao pagina={pagina} totalPaginas={meta.paginas} aoMudar={irParaPagina} />
      </Cartao>

      <Confirmacao
        aberto={idParaExcluir !== null}
        titulo="Excluir ator"
        mensagem="Esta ação não pode ser desfeita. O ator será desvinculado dos filmes em que aparece."
        aoConfirmar={() => void confirmarExclusao()}
        aoCancelar={() => setIdParaExcluir(null)}
      />
    </>
  );
}

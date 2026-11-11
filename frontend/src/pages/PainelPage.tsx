import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Carregando } from '../components/ui/Carregando';
import { useAutenticacao } from '../contexts/AuthContext';
import {
  servicoAtores,
  servicoCategorias,
  servicoDiretores,
  servicoFilmes,
} from '../domain/servicos/recursos';
import { mensagemDoErro } from '../utils/erros';

interface Contadores {
  filmes: number;
  categorias: number;
  atores: number;
  diretores: number;
}

interface CartaoResumoProps {
  titulo: string;
  valor: number;
  descricao: string;
  rota: string;
  icone: string;
}

/** Cartão de resumo com contador — componente exclusivo desta página. */
function CartaoResumo({ titulo, valor, descricao, rota, icone }: CartaoResumoProps) {
  return (
    <Link to={rota} className="cartao-resumo">
      <span className="cartao-resumo__icone" aria-hidden="true">
        {icone}
      </span>
      <div className="cartao-resumo__corpo">
        <h2 className="cartao-resumo__valor">{valor}</h2>
        <p className="cartao-resumo__titulo">{titulo}</p>
        <p className="cartao-resumo__descricao">{descricao}</p>
      </div>
    </Link>
  );
}

export function PainelPage() {
  const { usuario } = useAutenticacao();
  const [contadores, setContadores] = useState<Contadores | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    Promise.all([
      servicoFilmes.listar(1, 1),
      servicoCategorias.listar(1, 1),
      servicoAtores.listar(1, 1),
      servicoDiretores.listar(1, 1),
    ])
      .then(([filmes, categorias, atores, diretores]) => {
        if (!ativo) {
          return;
        }

        setContadores({
          filmes: filmes.meta.total,
          categorias: categorias.meta.total,
          atores: atores.meta.total,
          diretores: diretores.meta.total,
        });
      })
      .catch((excecao) => {
        if (ativo) {
          setErro(mensagemDoErro(excecao));
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <>
      <div className="painel-boasvindas">
        <h1 className="pagina-cabecalho__titulo">Olá, {usuario?.nome ?? 'Usuário'} 👋</h1>
        <p className="pagina-cabecalho__descricao">
          Este é o painel de gestão do catálogo. Escolha um módulo para começar.
        </p>
      </div>

      {erro !== null ? <Alerta tipo="erro" mensagem={erro} /> : null}

      {contadores === null && erro === null ? (
        <div className="tela-cheia tela-cheia--pagina" role="status">
          <Carregando />
        </div>
      ) : null}

      {contadores !== null ? (
        <div className="painel-grade">
          <CartaoResumo
            titulo="Filmes"
            valor={contadores.filmes}
            descricao="Catálogo completo com capa, sinopse e elenco"
            rota="/filmes"
            icone="🎬"
          />
          <CartaoResumo
            titulo="Categorias"
            valor={contadores.categorias}
            descricao="Gêneros que classificam os filmes"
            rota="/categorias"
            icone="🏷️"
          />
          <CartaoResumo
            titulo="Atores"
            valor={contadores.atores}
            descricao="Elenco disponível para vincular aos filmes"
            rota="/atores"
            icone="🎭"
          />
          <CartaoResumo
            titulo="Diretores"
            valor={contadores.diretores}
            descricao="Direção dos filmes do catálogo"
            rota="/diretores"
            icone="🎥"
          />
        </div>
      ) : null}
    </>
  );
}

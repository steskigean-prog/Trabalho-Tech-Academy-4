import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { AreaTexto } from '../components/ui/AreaTexto';
import { Botao } from '../components/ui/Botao';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { CampoSelecao } from '../components/ui/CampoSelecao';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';
import { Carregando } from '../components/ui/Carregando';
import { ListaSelecao } from '../components/ui/ListaSelecao';
import type { Categoria } from '../domain/entidades/Categoria';
import { Filme } from '../domain/entidades/Filme';
import type { Ator, Diretor } from '../domain/entidades/Pessoa';
import { ErroValidacao } from '../domain/excecoes/ErroValidacao';
import {
  servicoAtores,
  servicoCategorias,
  servicoDiretores,
  servicoFilmes,
} from '../domain/servicos/recursos';
import { Validacao } from '../domain/validadores/Validacao';
import { ValidadorAno } from '../domain/validadores/ValidadorAno';
import { ValidadorObrigatorio } from '../domain/validadores/ValidadorObrigatorio';
import { ValidadorRegex } from '../domain/validadores/ValidadorRegex';
import { ValidadorTamanhoMinimo } from '../domain/validadores/ValidadorTamanhoMinimo';
import { detalhesDoErro, mensagemDoErro } from '../utils/erros';

interface CamposFilme {
  titulo: string;
  original: string;
  ano: string;
  categoriaId: string;
  diretorId: string;
  youtube: string;
  capa: string;
  sinopse: string;
}

const CAMPOS_INICIAIS: CamposFilme = {
  titulo: '',
  original: '',
  ano: '',
  categoriaId: '',
  diretorId: '',
  youtube: '',
  capa: '',
  sinopse: '',
};

/**
 * Monta a entidade Filme a partir dos campos do formulário.
 *
 * Os setters da entidade validam cada regra de negócio (encapsulamento) e o
 * elenco é definido por ids, preservando os nomes já conhecidos.
 */
function montarFilme(
  campos: CamposFilme,
  elenco: number[],
  atores: Ator[],
  idEdicao: number | null,
): Filme {
  const filme = new Filme({
    id: idEdicao ?? 0,
    titulo: '',
    original: '',
    ano: 0,
    categoria_id: 0,
    diretor_id: 0,
    youtube: '',
    capa: '',
    sinopse: '',
    categoria_nome: '',
    diretor_nome: '',
    elenco: [],
  });

  filme.titulo = campos.titulo;
  filme.tituloOriginal = campos.original;
  filme.ano = Number(campos.ano);
  filme.categoriaId = Number(campos.categoriaId);
  filme.diretorId = Number(campos.diretorId);
  filme.youtube = campos.youtube;
  filme.capa = campos.capa;
  filme.sinopse = campos.sinopse;
  filme.definirElencoPorIds(
    elenco,
    new Map(atores.map((ator) => [ator.id ?? 0, ator.nome])),
  );
  filme.id = idEdicao; // null = novo registro

  return filme;
}

/** Prévia da capa informada — componente exclusivo desta página. */
function PreviaDaCapa({ capa, titulo }: { capa: string; titulo: string }) {
  return (
    <div className="previa-capa">
      <img
        src={capa}
        alt={`Prévia da capa${titulo !== '' ? ` de ${titulo}` : ''}`}
        className="previa-capa__imagem"
      />
      <span className="previa-capa__rotulo">Prévia da capa</span>
    </div>
  );
}

export function FilmeFormPage() {
  const { id } = useParams<{ id: string }>();
  const idEdicao = id !== undefined ? Number(id) : null;
  const modoEdicao = idEdicao !== null;
  const navegar = useNavigate();

  const [campos, setCampos] = useState<CamposFilme>(CAMPOS_INICIAIS);
  const [elencoSelecionado, setElencoSelecionado] = useState<number[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [diretores, setDiretores] = useState<Diretor[]>([]);
  const [atores, setAtores] = useState<Ator[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // Opções dos relacionamentos (sempre) + o filme (quando editando)
    const promessas: Array<Promise<unknown>> = [
      servicoCategorias.listar(1, 100).then((resultado) => setCategorias(resultado.data)),
      servicoDiretores.listar(1, 100).then((resultado) => setDiretores(resultado.data)),
      servicoAtores.listar(1, 100).then((resultado) => setAtores(resultado.data)),
    ];

    if (idEdicao !== null) {
      promessas.push(
        servicoFilmes.buscar(idEdicao).then((filme) => {
          setCampos({
            titulo: filme.titulo,
            original: filme.tituloOriginal,
            ano: String(filme.ano),
            categoriaId: String(filme.categoriaId),
            diretorId: String(filme.diretorId),
            youtube: filme.youtube,
            capa: filme.capa,
            sinopse: filme.sinopse,
          });
          setElencoSelecionado(filme.elenco.map((ator) => ator.id));
        }),
      );
    }

    Promise.all(promessas)
      .catch((excecao) => setErroGeral(mensagemDoErro(excecao)))
      .finally(() => setCarregando(false));
  }, [idEdicao]);

  function definirCampo<Campo extends keyof CamposFilme>(campo: Campo, valor: string): void {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  }

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    // Validação no cliente — duplica todas as regras do backend
    const errosValidacao = Validacao.executar([
      {
        campo: 'titulo',
        valor: campos.titulo,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(3)],
      },
      {
        campo: 'original',
        valor: campos.original,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(2)],
      },
      {
        campo: 'ano',
        valor: campos.ano,
        validadores: [
          new ValidadorObrigatorio('Informe o ano de lançamento'),
          new ValidadorAno(),
        ],
      },
      {
        campo: 'categoria_id',
        valor: campos.categoriaId,
        validadores: [new ValidadorObrigatorio('Selecione a categoria')],
      },
      {
        campo: 'diretor_id',
        valor: campos.diretorId,
        validadores: [new ValidadorObrigatorio('Selecione o diretor')],
      },
      {
        campo: 'youtube',
        valor: campos.youtube,
        validadores: [
          new ValidadorObrigatorio(),
          new ValidadorRegex(
            /^[A-Za-z0-9_-]{11}$/,
            'Informe o código do YouTube (11 caracteres)',
          ),
        ],
      },
      {
        campo: 'capa',
        valor: campos.capa,
        validadores: [
          new ValidadorObrigatorio(),
          new ValidadorRegex(/^(https?:\/\/|\/)\S+$/, 'Informe a URL da capa'),
        ],
      },
      {
        campo: 'sinopse',
        valor: campos.sinopse,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(10)],
      },
    ]);

    setErros(errosValidacao);

    if (Validacao.temErros(errosValidacao)) {
      return;
    }

    setSalvando(true);

    try {
      await servicoFilmes.salvar(montarFilme(campos, elencoSelecionado, atores, idEdicao));
      navegar('/filmes');
    } catch (excecao) {
      if (excecao instanceof ErroValidacao) {
        setErros((atuais) => ({ ...atuais, ...excecao.campos }));
      } else {
        const detalhes = detalhesDoErro(excecao);

        if (Object.keys(detalhes).length > 0) {
          setErros((atuais) => ({ ...atuais, ...detalhes }));
        } else {
          setErroGeral(mensagemDoErro(excecao));
        }
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="tela-cheia tela-cheia--pagina" role="status">
        <Carregando />
      </div>
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo={modoEdicao ? 'Editar filme' : 'Novo filme'}
        descricao="Preencha os dados do filme, sua categoria, a direção e o elenco."
        acoes={
          <Link to="/filmes" className="btn btn-secundario">
            ← Voltar
          </Link>
        }
      />

      {erroGeral !== null ? <Alerta tipo="erro" mensagem={erroGeral} /> : null}

      <Cartao>
        <form className="formulario" onSubmit={aoSubmeter} noValidate>
          <div className="formulario__linha formulario__linha--2">
            <CampoTexto
              rotulo="Título"
              name="titulo"
              value={campos.titulo}
              onChange={(evento) => definirCampo('titulo', evento.target.value)}
              erro={erros.titulo}
            />
            <CampoTexto
              rotulo="Título original"
              name="original"
              value={campos.original}
              onChange={(evento) => definirCampo('original', evento.target.value)}
              erro={erros.original}
            />
          </div>

          <div className="formulario__linha formulario__linha--3">
            <CampoTexto
              rotulo="Ano"
              name="ano"
              type="number"
              inputMode="numeric"
              placeholder="2026"
              value={campos.ano}
              onChange={(evento) => definirCampo('ano', evento.target.value)}
              erro={erros.ano}
            />
            <CampoSelecao
              rotulo="Categoria"
              name="categoria_id"
              value={campos.categoriaId}
              onChange={(evento) => definirCampo('categoriaId', evento.target.value)}
              erro={erros.categoria_id}
              opcoes={categorias.map((categoria) => ({
                valor: String(categoria.id ?? 0),
                texto: categoria.nome,
              }))}
            >
              <option value="">Selecione a categoria</option>
            </CampoSelecao>
            <CampoSelecao
              rotulo="Direção"
              name="diretor_id"
              value={campos.diretorId}
              onChange={(evento) => definirCampo('diretorId', evento.target.value)}
              erro={erros.diretor_id}
              opcoes={diretores.map((diretor) => ({
                valor: String(diretor.id ?? 0),
                texto: diretor.nome,
              }))}
            >
              <option value="">Selecione o diretor</option>
            </CampoSelecao>
          </div>

          <div className="formulario__linha formulario__linha--2">
            <CampoTexto
              rotulo="Código do YouTube (11 caracteres)"
              name="youtube"
              placeholder="Ex.: psF5B6jJBV4"
              value={campos.youtube}
              onChange={(evento) => definirCampo('youtube', evento.target.value)}
              erro={erros.youtube}
            />
            <CampoTexto
              rotulo="URL da capa"
              name="capa"
              placeholder="/arquivos/capa.jpg"
              value={campos.capa}
              onChange={(evento) => definirCampo('capa', evento.target.value)}
              erro={erros.capa}
            />
          </div>

          <AreaTexto
            rotulo="Sinopse"
            name="sinopse"
            rows={5}
            value={campos.sinopse}
            onChange={(evento) => definirCampo('sinopse', evento.target.value)}
            erro={erros.sinopse}
          />

          <ListaSelecao
            rotulo="Elenco (atores)"
            opcoes={atores.map((ator) => ({
              valor: ator.id ?? 0,
              texto: `${ator.nome} · ${ator.nacionalidade}`,
            }))}
            selecionados={elencoSelecionado}
            aoAlterar={setElencoSelecionado}
          />

          {campos.capa !== '' ? <PreviaDaCapa capa={campos.capa} titulo={campos.titulo} /> : null}

          <div className="formulario__acoes">
            <Botao type="submit" carregando={salvando}>
              {modoEdicao ? 'Salvar alterações' : 'Cadastrar filme'}
            </Botao>
          </div>
        </form>
      </Cartao>
    </>
  );
}

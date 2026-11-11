import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';
import { Carregando } from '../components/ui/Carregando';
import { Categoria } from '../domain/entidades/Categoria';
import { ErroValidacao } from '../domain/excecoes/ErroValidacao';
import { servicoCategorias } from '../domain/servicos/recursos';
import { Validacao } from '../domain/validadores/Validacao';
import { ValidadorObrigatorio } from '../domain/validadores/ValidadorObrigatorio';
import { ValidadorTamanhoMinimo } from '../domain/validadores/ValidadorTamanhoMinimo';
import { detalhesDoErro, mensagemDoErro } from '../utils/erros';

/**
 * Monta a entidade Categoria a partir dos campos do formulário.
 *
 * O setter valida a regra de negócio (encapsulamento da entidade); o id null
 * indica criação, id numérico indica edição.
 */
function montarCategoria(nome: string, idEdicao: number | null): Categoria {
  const categoria = new Categoria({ id: idEdicao ?? 0, categoria: '' });
  categoria.nome = nome;
  categoria.id = idEdicao;
  return categoria;
}

export function CategoriaFormPage() {
  const { id } = useParams<{ id: string }>();
  const idEdicao = id !== undefined ? Number(id) : null;
  const modoEdicao = idEdicao !== null;
  const navegar = useNavigate();

  const [nome, setNome] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (idEdicao === null) {
      return;
    }

    // Editar um id inexistente exibe o erro amigável da API (404)
    servicoCategorias
      .buscar(idEdicao)
      .then((categoria) => setNome(categoria.nome))
      .catch((excecao) => setErroGeral(mensagemDoErro(excecao)))
      .finally(() => setCarregando(false));
  }, [idEdicao]);

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    const errosValidacao = Validacao.executar([
      {
        campo: 'categoria',
        valor: nome,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(2)],
      },
    ]);

    setErros(errosValidacao);

    if (Validacao.temErros(errosValidacao)) {
      return;
    }

    setSalvando(true);

    try {
      await servicoCategorias.salvar(montarCategoria(nome, idEdicao));
      navegar('/categorias');
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
        titulo={modoEdicao ? 'Editar categoria' : 'Nova categoria'}
        descricao="Cadastre ou atualize um gênero do catálogo."
        acoes={
          <Link to="/categorias" className="btn btn-secundario">
            ← Voltar
          </Link>
        }
      />

      {erroGeral !== null ? <Alerta tipo="erro" mensagem={erroGeral} /> : null}

      <Cartao>
        <form className="formulario formulario--estreito" onSubmit={aoSubmeter} noValidate>
          <CampoTexto
            rotulo="Nome da categoria"
            name="categoria"
            placeholder="Ex.: Ficção Científica"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            erro={erros.categoria}
          />

          <div className="formulario__acoes">
            <Botao type="submit" carregando={salvando}>
              {modoEdicao ? 'Salvar alterações' : 'Cadastrar categoria'}
            </Botao>
          </div>
        </form>
      </Cartao>
    </>
  );
}

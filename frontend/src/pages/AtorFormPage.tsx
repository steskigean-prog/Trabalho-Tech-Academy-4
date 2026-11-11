import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';
import { Carregando } from '../components/ui/Carregando';
import { Ator } from '../domain/entidades/Pessoa';
import { ErroValidacao } from '../domain/excecoes/ErroValidacao';
import { servicoAtores } from '../domain/servicos/recursos';
import { Validacao } from '../domain/validadores/Validacao';
import { ValidadorObrigatorio } from '../domain/validadores/ValidadorObrigatorio';
import { ValidadorTamanhoMinimo } from '../domain/validadores/ValidadorTamanhoMinimo';
import { detalhesDoErro, mensagemDoErro } from '../utils/erros';

/** Monta a entidade Ator a partir dos campos do formulário. */
function montarAtor(
  nome: string,
  nacionalidade: string,
  idEdicao: number | null,
): Ator {
  const ator = new Ator({ id: idEdicao ?? 0, nome: '', nacionalidade: '', papel: '' });
  ator.nome = nome;
  ator.nacionalidade = nacionalidade;
  ator.id = idEdicao;
  return ator;
}

export function AtorFormPage() {
  const { id } = useParams<{ id: string }>();
  const idEdicao = id !== undefined ? Number(id) : null;
  const modoEdicao = idEdicao !== null;
  const navegar = useNavigate();

  const [campos, setCampos] = useState({ nome: '', nacionalidade: '' });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (idEdicao === null) {
      return;
    }

    servicoAtores
      .buscar(idEdicao)
      .then((ator) => setCampos({ nome: ator.nome, nacionalidade: ator.nacionalidade }))
      .catch((excecao) => setErroGeral(mensagemDoErro(excecao)))
      .finally(() => setCarregando(false));
  }, [idEdicao]);

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    const errosValidacao = Validacao.executar([
      {
        campo: 'nome',
        valor: campos.nome,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(3)],
      },
      {
        campo: 'nacionalidade',
        valor: campos.nacionalidade,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(3)],
      },
    ]);

    setErros(errosValidacao);

    if (Validacao.temErros(errosValidacao)) {
      return;
    }

    setSalvando(true);

    try {
      await servicoAtores.salvar(montarAtor(campos.nome, campos.nacionalidade, idEdicao));
      navegar('/atores');
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
        titulo={modoEdicao ? 'Editar ator' : 'Novo ator'}
        descricao="Cadastre ou atualize um integrante do elenco."
        acoes={
          <Link to="/atores" className="btn btn-secundario">
            ← Voltar
          </Link>
        }
      />

      {erroGeral !== null ? <Alerta tipo="erro" mensagem={erroGeral} /> : null}

      <Cartao>
        <form className="formulario formulario--estreito" onSubmit={aoSubmeter} noValidate>
          <CampoTexto
            rotulo="Nome completo"
            name="nome"
            placeholder="Ex.: Pedro Pascal"
            value={campos.nome}
            onChange={(evento) => setCampos({ ...campos, nome: evento.target.value })}
            erro={erros.nome}
          />
          <CampoTexto
            rotulo="Nacionalidade"
            name="nacionalidade"
            placeholder="Ex.: Chile"
            value={campos.nacionalidade}
            onChange={(evento) =>
              setCampos({ ...campos, nacionalidade: evento.target.value })
            }
            erro={erros.nacionalidade}
          />

          <div className="formulario__acoes">
            <Botao type="submit" carregando={salvando}>
              {modoEdicao ? 'Salvar alterações' : 'Cadastrar ator'}
            </Botao>
          </div>
        </form>
      </Cartao>
    </>
  );
}

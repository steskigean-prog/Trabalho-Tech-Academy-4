import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { CampoTexto } from '../components/ui/CampoTexto';
import { useAutenticacao } from '../contexts/AuthContext';
import { Validacao } from '../domain/validadores/Validacao';
import { ValidadorEmail } from '../domain/validadores/ValidadorEmail';
import { ValidadorObrigatorio } from '../domain/validadores/ValidadorObrigatorio';
import { mensagemDoErro } from '../utils/erros';

interface EstadoLogin {
  de?: string;
  mensagem?: string;
}

interface CamposLogin {
  email: string;
  senha: string;
}

const CAMPOS_INICIAIS: CamposLogin = { email: '', senha: '' };

export function LoginPage() {
  const { entrar, usuario } = useAutenticacao();
  const navegar = useNavigate();
  const localizacao = useLocation();
  const estado = (localizacao.state ?? null) as EstadoLogin | null;
  const destino = estado?.de ?? '/';

  const [campos, setCampos] = useState<CamposLogin>(CAMPOS_INICIAIS);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  // Já autenticado: vai direto ao destino
  if (usuario !== null) {
    return <Navigate to={destino} replace />;
  }

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    // Validação no cliente — duplica a regra do backend
    const errosValidacao = Validacao.executar([
      {
        campo: 'email',
        valor: campos.email,
        validadores: [new ValidadorObrigatorio('Preencha o e-mail'), new ValidadorEmail()],
      },
      {
        campo: 'senha',
        valor: campos.senha,
        validadores: [new ValidadorObrigatorio('Preencha a senha')],
      },
    ]);

    setErros(errosValidacao);

    if (Validacao.temErros(errosValidacao)) {
      return;
    }

    setEntrando(true);

    try {
      await entrar(campos.email.trim(), campos.senha);
      navegar(destino, { replace: true });
    } catch (excecao) {
      // Erro amigável da API (ex.: "E-mail ou senha incorretos")
      setErroGeral(mensagemDoErro(excecao));
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="autenticacao">
      <div className="autenticacao__cartao cartao">
        <img src="/logo.png" alt="iMDB Admin" className="autenticacao__logo" />
        <h1 className="autenticacao__titulo">Entrar no sistema</h1>

        {estado?.mensagem !== undefined ? <Alerta tipo="sucesso" mensagem={estado.mensagem} /> : null}
        {erroGeral !== null ? <Alerta tipo="erro" mensagem={erroGeral} /> : null}

        <form className="formulario" onSubmit={aoSubmeter} noValidate>
          <CampoTexto
            rotulo="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={campos.email}
            onChange={(evento) => setCampos({ ...campos, email: evento.target.value })}
            erro={erros.email}
          />
          <CampoTexto
            rotulo="Senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            value={campos.senha}
            onChange={(evento) => setCampos({ ...campos, senha: evento.target.value })}
            erro={erros.senha}
          />
          <Botao type="submit" carregando={entrando} className="btn--bloco">
            Entrar
          </Botao>
        </form>

        <p className="autenticacao__alternativa">
          Ainda não tem conta? <Link to="/registro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

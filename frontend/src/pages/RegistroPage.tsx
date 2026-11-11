import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { CampoTexto } from '../components/ui/CampoTexto';
import { MedidorSenha } from '../components/ui/MedidorSenha';
import { servicoAutenticacao } from '../domain/servicos/ServicoAutenticacao';
import { Validacao } from '../domain/validadores/Validacao';
import { ValidadorCpf } from '../domain/validadores/ValidadorCpf';
import { ValidadorEmail } from '../domain/validadores/ValidadorEmail';
import { ValidadorObrigatorio } from '../domain/validadores/ValidadorObrigatorio';
import { ValidadorSenha } from '../domain/validadores/ValidadorSenha';
import { ValidadorTamanhoMinimo } from '../domain/validadores/ValidadorTamanhoMinimo';
import { detalhesDoErro, mensagemDoErro } from '../utils/erros';
import { formatarCpf } from '../utils/formato';

interface CamposRegistro {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmacao: string;
}

const CAMPOS_INICIAIS: CamposRegistro = {
  nome: '',
  email: '',
  cpf: '',
  senha: '',
  confirmacao: '',
};

export function RegistroPage() {
  const navegar = useNavigate();

  const [campos, setCampos] = useState<CamposRegistro>(CAMPOS_INICIAIS);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function definirCampo<Campo extends keyof CamposRegistro>(campo: Campo, valor: string): void {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  }

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);

    // Validação no cliente — duplica todas as regras do backend
    const errosValidacao = Validacao.executar([
      {
        campo: 'nome',
        valor: campos.nome,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(3)],
      },
      {
        campo: 'email',
        valor: campos.email,
        validadores: [new ValidadorObrigatorio(), new ValidadorEmail()],
      },
      {
        campo: 'senha',
        valor: campos.senha,
        validadores: [new ValidadorObrigatorio(), new ValidadorSenha()],
      },
      {
        campo: 'cpf',
        valor: campos.cpf,
        validadores: [new ValidadorObrigatorio(), new ValidadorCpf()],
      },
    ]);

    // Verificação dupla: a confirmação precisa coincidir com a senha
    if (campos.senha !== campos.confirmacao) {
      errosValidacao.confirmacao = 'As senhas não coincidem';
    }

    setErros(errosValidacao);

    if (Validacao.temErros(errosValidacao)) {
      return;
    }

    setSalvando(true);

    try {
      await servicoAutenticacao.registrar({
        nome: campos.nome,
        email: campos.email,
        senha: campos.senha,
        cpf: campos.cpf,
      });

      navegar('/login', {
        state: { mensagem: 'Cadastro realizado com sucesso! Use suas credenciais para entrar.' },
      });
    } catch (excecao) {
      const detalhes = detalhesDoErro(excecao);

      if (Object.keys(detalhes).length > 0) {
        setErros(detalhes);
      } else {
        setErroGeral(mensagemDoErro(excecao));
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="autenticacao">
      <div className="autenticacao__cartao autenticacao__cartao--largo cartao">
        <img src="/logo.png" alt="iMDB Admin" className="autenticacao__logo" />
        <h1 className="autenticacao__titulo">Criar conta</h1>
        <p className="autenticacao__subtitulo">Todos os campos são obrigatórios</p>

        {erroGeral !== null ? <Alerta tipo="erro" mensagem={erroGeral} /> : null}

        <form className="formulario" onSubmit={aoSubmeter} noValidate>
          <CampoTexto
            rotulo="Nome completo"
            name="nome"
            autoComplete="name"
            value={campos.nome}
            onChange={(evento) => definirCampo('nome', evento.target.value)}
            erro={erros.nome}
          />
          <CampoTexto
            rotulo="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={campos.email}
            onChange={(evento) => definirCampo('email', evento.target.value)}
            erro={erros.email}
          />
          <CampoTexto
            rotulo="CPF"
            name="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={formatarCpf(campos.cpf)}
            onChange={(evento) =>
              definirCampo('cpf', evento.target.value.replace(/\D/g, '').slice(0, 11))
            }
            erro={erros.cpf}
          />

          <div className="campo-senha">
            <CampoTexto
              rotulo="Senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              value={campos.senha}
              onChange={(evento) => definirCampo('senha', evento.target.value)}
              erro={erros.senha}
            />
            <MedidorSenha senha={campos.senha} />
          </div>

          <CampoTexto
            rotulo="Confirmar senha"
            name="confirmacao"
            type="password"
            autoComplete="new-password"
            value={campos.confirmacao}
            onChange={(evento) => definirCampo('confirmacao', evento.target.value)}
            erro={erros.confirmacao}
          />

          <Botao type="submit" carregando={salvando} className="btn--bloco">
            Cadastrar
          </Botao>
        </form>

        <p className="autenticacao__alternativa">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

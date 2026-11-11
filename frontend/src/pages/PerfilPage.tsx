import { useState, type FormEvent } from 'react';
import { Alerta } from '../components/ui/Alerta';
import { Botao } from '../components/ui/Botao';
import { CabecalhoPagina } from '../components/ui/CabecalhoPagina';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';
import { MedidorSenha } from '../components/ui/MedidorSenha';
import { useAutenticacao } from '../contexts/AuthContext';
import { servicoAutenticacao } from '../domain/servicos/ServicoAutenticacao';
import { Validacao } from '../domain/validadores/Validacao';
import { ValidadorCpf } from '../domain/validadores/ValidadorCpf';
import { ValidadorObrigatorio } from '../domain/validadores/ValidadorObrigatorio';
import { ValidadorSenha } from '../domain/validadores/ValidadorSenha';
import { ValidadorTamanhoMinimo } from '../domain/validadores/ValidadorTamanhoMinimo';
import { detalhesDoErro, mensagemDoErro } from '../utils/erros';
import { formatarCpf } from '../utils/formato';

interface CamposPerfil {
  nome: string;
  cpf: string;
  senha: string;
  confirmacao: string;
}

export function PerfilPage() {
  const { usuario, atualizarUsuario } = useAutenticacao();

  const [campos, setCampos] = useState<CamposPerfil>(() => ({
    nome: usuario?.nome ?? '',
    cpf: usuario?.cpf ?? '',
    senha: '',
    confirmacao: '',
  }));
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (usuario === null) {
    // Rota protegida garante usuário autenticado; satisfaz apenas o TypeScript
    return null;
  }

  function definirCampo<Campo extends keyof CamposPerfil>(campo: Campo, valor: string): void {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
  }

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroGeral(null);
    setSucesso(null);

    // Todos os campos são obrigatórios na edição do perfil
    const errosValidacao = Validacao.executar([
      {
        campo: 'nome',
        valor: campos.nome,
        validadores: [new ValidadorObrigatorio(), new ValidadorTamanhoMinimo(3)],
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

    if (campos.senha !== campos.confirmacao) {
      errosValidacao.confirmacao = 'As senhas não coincidem';
    }

    setErros(errosValidacao);

    if (Validacao.temErros(errosValidacao)) {
      return;
    }

    setSalvando(true);

    try {
      const atualizado = await servicoAutenticacao.atualizarPerfil({
        nome: campos.nome,
        cpf: campos.cpf,
        senha: campos.senha,
      });

      // Atualiza o contexto global (navbar e demais telas refletem na hora)
      atualizarUsuario(atualizado);
      setSucesso('Perfil atualizado com sucesso.');
      setCampos((atuais) => ({ ...atuais, senha: '', confirmacao: '' }));
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
    <>
      <CabecalhoPagina
        titulo="Meu perfil"
        descricao="Atualize seus dados cadastrais. O e-mail não pode ser alterado."
      />

      {sucesso !== null ? <Alerta tipo="sucesso" mensagem={sucesso} /> : null}
      {erroGeral !== null ? <Alerta tipo="erro" mensagem={erroGeral} /> : null}

      <Cartao>
        <form className="formulario" onSubmit={aoSubmeter} noValidate>
          <CampoTexto
            rotulo="Nome completo"
            name="nome"
            value={campos.nome}
            onChange={(evento) => definirCampo('nome', evento.target.value)}
            erro={erros.nome}
          />

          <CampoTexto
            rotulo="E-mail (não pode ser alterado)"
            name="email"
            type="email"
            value={usuario.email}
            disabled
          />

          <CampoTexto
            rotulo="CPF"
            name="cpf"
            inputMode="numeric"
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

          <div className="formulario__acoes">
            <Botao type="submit" carregando={salvando}>
              Salvar alterações
            </Botao>
          </div>
        </form>
      </Cartao>
    </>
  );
}

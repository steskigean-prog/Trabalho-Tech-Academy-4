import { armazenamentoToken, http } from '../../api/http';
import { Usuario } from '../entidades/Usuario';
import type { DadosUsuario, RespostaLogin } from '../../tipos';

/** Dados do formulário de cadastro de usuário. */
export interface DadosRegistro {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
}

/** Dados do formulário de edição do próprio perfil. */
export interface DadosEdicaoPerfil {
  nome: string;
  cpf: string;
  senha: string;
}

/**
 * Serviço de autenticação e perfil do usuário.
 *
 * Fluxo: login armazena o token JWT no localStorage; o perfil é consultado
 * com o token para hidratar o contexto global de usuário.
 */
export class ServicoAutenticacao {
  async entrar(email: string, senha: string): Promise<Usuario> {
    const resposta = await http.post<RespostaLogin>('/auth/login', { email, senha });

    armazenamentoToken.salvar(resposta.token);

    return new Usuario(resposta.usuario);
  }

  async registrar(dados: DadosRegistro): Promise<void> {
    await http.post('/auth/registro', {
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      senha: dados.senha,
      cpf: dados.cpf,
    });
  }

  async obterPerfil(): Promise<Usuario> {
    return new Usuario(await http.get<DadosUsuario>('/perfil'));
  }

  async atualizarPerfil(dados: DadosEdicaoPerfil): Promise<Usuario> {
    const resposta = await http.put<{ mensagem: string; usuario: DadosUsuario }>('/perfil', {
      nome: dados.nome.trim(),
      cpf: dados.cpf,
      senha: dados.senha,
    });

    return new Usuario(resposta.usuario);
  }

  sair(): void {
    armazenamentoToken.limpar();
  }
}

export const servicoAutenticacao = new ServicoAutenticacao();

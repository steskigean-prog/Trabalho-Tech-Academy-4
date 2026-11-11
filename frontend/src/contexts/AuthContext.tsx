import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { armazenamentoToken } from '../api/http';
import { ErroAplicacao } from '../domain/excecoes/ErroAplicacao';
import { Usuario } from '../domain/entidades/Usuario';
import { servicoAutenticacao } from '../domain/servicos/ServicoAutenticacao';

/**
 * Contexto global do usuário autenticado.
 *
 * Disponibiliza o usuário (dados do perfil), o estado de carregamento da
 * sessão e as ações de entrar/sair/atualizar. O token JWT permanece no
 * localStorage; o usuário vive apenas em memória durante a sessão.
 */
export interface ContextoAutenticacao {
  usuario: Usuario | null;
  carregando: boolean;
  entrar(email: string, senha: string): Promise<void>;
  sair(): void;
  atualizarUsuario(usuario: Usuario): void;
}

const Contexto = createContext<ContextoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Recupera a sessão ao abrir a aplicação (token -> GET /perfil)
  useEffect(() => {
    const token = armazenamentoToken.obter();

    if (token === null) {
      setCarregando(false);
      return;
    }

    servicoAutenticacao
      .obterPerfil()
      .then((perfil) => setUsuario(perfil))
      .catch(() => armazenamentoToken.limpar())
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const autenticado = await servicoAutenticacao.entrar(email, senha);
    setUsuario(autenticado);
  }, []);

  const sair = useCallback(() => {
    servicoAutenticacao.sair();
    setUsuario(null);
  }, []);

  const atualizarUsuario = useCallback((atualizado: Usuario) => {
    setUsuario(atualizado);
  }, []);

  const valor = useMemo<ContextoAutenticacao>(
    () => ({ usuario, carregando, entrar, sair, atualizarUsuario }),
    [usuario, carregando, entrar, sair, atualizarUsuario],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAutenticacao(): ContextoAutenticacao {
  const contexto = useContext(Contexto);

  if (contexto === null) {
    throw new ErroAplicacao('useAutenticacao deve ser usado dentro de ProvedorAutenticacao');
  }

  return contexto;
}

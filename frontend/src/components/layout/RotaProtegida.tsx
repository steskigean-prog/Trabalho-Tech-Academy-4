import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../contexts/AuthContext';
import { Carregando } from '../ui/Carregando';

/**
 * Guarda de rotas autenticadas.
 *
 * Enquanto a sessão é restaurada exibe o indicador de carregamento; sem
 * usuário logado redireciona para /login preservando a rota de origem.
 */
export function RotaProtegida() {
  const { usuario, carregando } = useAutenticacao();
  const localizacao = useLocation();

  if (carregando) {
    return (
      <div className="tela-cheia" role="status">
        <Carregando />
        <p>Restaurando sua sessão…</p>
      </div>
    );
  }

  if (usuario === null) {
    return <Navigate to="/login" replace state={{ de: localizacao.pathname }} />;
  }

  return <Outlet />;
}

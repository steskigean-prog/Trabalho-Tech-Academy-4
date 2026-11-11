import { Link } from 'react-router-dom';

/** Tela exibida para rotas inexistentes (404). */
export function NaoEncontradaPage() {
  return (
    <div className="nao-encontrada">
      <p className="nao-encontrada__codigo" aria-hidden="true">
        404
      </p>
      <h1>Página não encontrada</h1>
      <p>A página que você procura não existe ou foi removida do catálogo.</p>
      <Link to="/" className="btn btn-primario">
        Voltar ao painel
      </Link>
    </div>
  );
}

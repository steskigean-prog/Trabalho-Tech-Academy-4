import { Outlet } from 'react-router-dom';
import { BarraNavegacao } from './BarraNavegacao';

/** Estrutura das telas autenticadas: barra de navegação, conteúdo e rodapé. */
export function Layout() {
  return (
    <div className="layout">
      <BarraNavegacao />
      <main className="layout__conteudo">
        <Outlet />
      </main>
      <footer className="layout__rodape">
        <p>iMDB Admin · Gestão de catálogo de filmes · PHP + React/TypeScript + Docker</p>
      </footer>
    </div>
  );
}

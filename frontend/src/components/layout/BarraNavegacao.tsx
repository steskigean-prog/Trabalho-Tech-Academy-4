import { NavLink, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contexts/AuthContext';
import { classeCss } from '../../utils/formato';
import { Botao } from '../ui/Botao';

interface ItemNavegacao {
  para: string;
  rotulo: string;
  apenasExato?: boolean;
}

/** Itens do menu — um para cada CRUD do catálogo. */
const ITENS: readonly ItemNavegacao[] = [
  { para: '/', rotulo: 'Painel', apenasExato: true },
  { para: '/filmes', rotulo: 'Filmes' },
  { para: '/categorias', rotulo: 'Categorias' },
  { para: '/atores', rotulo: 'Atores' },
  { para: '/diretores', rotulo: 'Diretores' },
];

/** Barra de navegação principal: marca, links dos CRUDs e menu do usuário. */
export function BarraNavegacao() {
  const { usuario, sair } = useAutenticacao();
  const navegar = useNavigate();

  function aoSair() {
    sair();
    navegar('/login', { replace: true });
  }

  return (
    <header className="barra">
      <div className="barra__conteudo">
        <NavLink to="/" className="barra__marca">
          <img src="/logo.png" alt="Logotipo do iMDB Admin" className="barra__logo" />
          <span className="barra__titulo">
            iMDB <em>Admin</em>
          </span>
        </NavLink>

        <nav className="barra__nav" aria-label="Navegação principal">
          {ITENS.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              end={item.apenasExato === true}
              className={({ isActive }) => classeCss('barra__link', isActive && 'barra__link--ativa')}
            >
              {item.rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="barra__usuario">
          <NavLink to="/perfil" className="barra__perfil" title="Ver e editar meu perfil">
            <span className="barra__avatar" aria-hidden="true">
              {usuario?.nome.charAt(0).toUpperCase() ?? '?'}
            </span>
            <span className="barra__nome">{usuario?.nome ?? 'Usuário'}</span>
          </NavLink>
          <Botao variante="texto" onClick={aoSair}>
            Sair
          </Botao>
        </div>
      </div>
    </header>
  );
}

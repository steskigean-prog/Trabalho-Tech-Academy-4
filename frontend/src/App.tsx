import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { RotaProtegida } from './components/layout/RotaProtegida';
import { AtoresPage } from './pages/AtoresPage';
import { AtorFormPage } from './pages/AtorFormPage';
import { CategoriasPage } from './pages/CategoriasPage';
import { CategoriaFormPage } from './pages/CategoriaFormPage';
import { DiretoresPage } from './pages/DiretoresPage';
import { DiretorFormPage } from './pages/DiretorFormPage';
import { FilmeFormPage } from './pages/FilmeFormPage';
import { FilmesPage } from './pages/FilmesPage';
import { LoginPage } from './pages/LoginPage';
import { NaoEncontradaPage } from './pages/NaoEncontradaPage';
import { PainelPage } from './pages/PainelPage';
import { PerfilPage } from './pages/PerfilPage';
import { RegistroPage } from './pages/RegistroPage';

/**
 * Mapa de rotas da aplicação.
 *
 * /login e /registro são públicas; todas as demais ficam sob a guarda da
 * RotaProtegida (token JWT no localStorage) e dentro do Layout com barra de
 * navegação. Cada CRUD tem tela de listagem e formulário separados.
 */
export function App() {
  return (
    <Routes>
      {/* Autenticação (públicas) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Área autenticada */}
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<PainelPage />} />
          <Route path="/perfil" element={<PerfilPage />} />

          <Route path="/filmes" element={<FilmesPage />} />
          <Route path="/filmes/novo" element={<FilmeFormPage />} />
          <Route path="/filmes/:id/editar" element={<FilmeFormPage />} />

          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/categorias/novo" element={<CategoriaFormPage />} />
          <Route path="/categorias/:id/editar" element={<CategoriaFormPage />} />

          <Route path="/atores" element={<AtoresPage />} />
          <Route path="/atores/novo" element={<AtorFormPage />} />
          <Route path="/atores/:id/editar" element={<AtorFormPage />} />

          <Route path="/diretores" element={<DiretoresPage />} />
          <Route path="/diretores/novo" element={<DiretorFormPage />} />
          <Route path="/diretores/:id/editar" element={<DiretorFormPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NaoEncontradaPage />} />
    </Routes>
  );
}

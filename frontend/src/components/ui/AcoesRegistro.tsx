import { Link } from 'react-router-dom';
import { Botao } from './Botao';

interface PropsAcoesRegistro {
  rotaEditar: string;
  aoExcluir: () => void;
  rotulo: string;
}

/** Par de ações (editar/excluir) exibido em cada linha das listagens. */
export function AcoesRegistro({ rotaEditar, aoExcluir, rotulo }: PropsAcoesRegistro) {
  return (
    <div className="acoes-registro">
      <Link to={rotaEditar} className="btn btn-secundario">
        Editar
      </Link>
      <Botao variante="perigo" onClick={aoExcluir} aria-label={`Excluir ${rotulo}`}>
        Excluir
      </Botao>
    </div>
  );
}

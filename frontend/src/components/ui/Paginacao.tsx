import { classeCss } from '../../utils/formato';

interface PropsPaginacao {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
}

function paginasVisiveis(atual: number, total: number): number[] {
  const inicio = Math.max(1, Math.min(atual - 2, total - 4));
  const fim = Math.min(total, inicio + 4);

  const paginas: number[] = [];

  for (let pagina = inicio; pagina <= fim; pagina++) {
    paginas.push(pagina);
  }

  return paginas;
}

/** Controles de paginação das listagens. */
export function Paginacao({ pagina, totalPaginas, aoMudar }: PropsPaginacao) {
  if (totalPaginas <= 1) {
    return null;
  }

  const visiveis = paginasVisiveis(pagina, totalPaginas);

  return (
    <nav className="paginacao" aria-label="Paginação da listagem">
      <button
        type="button"
        className="btn btn-pagina"
        disabled={pagina <= 1}
        onClick={() => aoMudar(pagina - 1)}
      >
        ← Anterior
      </button>

      {visiveis.map((numero) => (
        <button
          key={numero}
          type="button"
          className={classeCss('btn', 'btn-pagina', numero === pagina && 'btn-pagina--ativa')}
          aria-current={numero === pagina ? 'page' : undefined}
          onClick={() => aoMudar(numero)}
        >
          {numero}
        </button>
      ))}

      <button
        type="button"
        className="btn btn-pagina"
        disabled={pagina >= totalPaginas}
        onClick={() => aoMudar(pagina + 1)}
      >
        Próxima →
      </button>
    </nav>
  );
}

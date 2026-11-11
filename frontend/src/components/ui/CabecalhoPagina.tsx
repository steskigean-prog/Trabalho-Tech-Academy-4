import { type ReactNode } from 'react';

interface PropsCabecalhoPagina {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}

/** Cabeçalho padrão das páginas: título, descrição e área de ações. */
export function CabecalhoPagina({ titulo, descricao, acoes }: PropsCabecalhoPagina) {
  return (
    <div className="pagina-cabecalho">
      <div className="pagina-cabecalho__textos">
        <h1 className="pagina-cabecalho__titulo">{titulo}</h1>
        {descricao !== undefined ? (
          <p className="pagina-cabecalho__descricao">{descricao}</p>
        ) : null}
      </div>
      {acoes !== undefined ? <div className="pagina-cabecalho__acoes">{acoes}</div> : null}
    </div>
  );
}

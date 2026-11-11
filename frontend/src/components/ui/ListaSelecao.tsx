import { classeCss } from '../../utils/formato';

export interface OpcaoLista {
  valor: number;
  texto: string;
}

interface PropsListaSelecao {
  rotulo: string;
  opcoes: OpcaoLista[];
  selecionados: number[];
  aoAlterar: (selecionados: number[]) => void;
  erro?: string;
}

/**
 * Lista de seleção múltipla (caixas de seleção) usada para escolher o
 * elenco do filme.
 */
export function ListaSelecao({
  rotulo,
  opcoes,
  selecionados,
  aoAlterar,
  erro,
}: PropsListaSelecao) {
  function alternar(valor: number, marcado: boolean) {
    const novos = marcado
      ? [...selecionados, valor]
      : selecionados.filter((item) => item !== valor);

    aoAlterar(novos.sort((a, b) => a - b));
  }

  return (
    <div className={classeCss('campo', erro !== undefined && 'campo--invalido')}>
      <span className="campo__rotulo">{rotulo}</span>

      <div className="lista-selecao" role="group" aria-label={rotulo}>
        {opcoes.length === 0 ? (
          <p className="lista-selecao__vazio">Nenhuma opção cadastrada</p>
        ) : (
          opcoes.map((opcao) => (
            <label key={opcao.valor} className="lista-selecao__item">
              <input
                type="checkbox"
                checked={selecionados.includes(opcao.valor)}
                onChange={(evento) => alternar(opcao.valor, evento.target.checked)}
              />
              {opcao.texto}
            </label>
          ))
        )}
      </div>

      {erro !== undefined ? (
        <span className="campo__erro" role="alert">
          {erro}
        </span>
      ) : null}
    </div>
  );
}

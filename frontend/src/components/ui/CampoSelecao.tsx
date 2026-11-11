import { type SelectHTMLAttributes } from 'react';
import { classeCss } from '../../utils/formato';

export interface Opcao {
  valor: string;
  texto: string;
}

interface PropsCampoSelecao extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo: string;
  erro?: string;
  opcoes: Opcao[];
}

/** Campo de seleção com rótulo, opções e estado de erro. */
export function CampoSelecao({
  rotulo,
  erro,
  opcoes,
  id,
  name,
  className,
  children,
  ...props
}: PropsCampoSelecao) {
  const identificador = id ?? name;

  return (
    <div className={classeCss('campo', erro !== undefined && 'campo--invalido', className)}>
      <label htmlFor={identificador}>{rotulo}</label>
      <select id={identificador} aria-invalid={erro !== undefined} {...props}>
        {children}
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.texto}
          </option>
        ))}
      </select>
      {erro !== undefined ? (
        <span className="campo__erro" role="alert">
          {erro}
        </span>
      ) : null}
    </div>
  );
}

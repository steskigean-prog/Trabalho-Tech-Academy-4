import { type InputHTMLAttributes } from 'react';
import { classeCss } from '../../utils/formato';

interface PropsCampoTexto extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  erro?: string;
}

/** Campo de texto com rótulo, estado de erro e acessibilidade. */
export function CampoTexto({ rotulo, erro, id, name, className, ...props }: PropsCampoTexto) {
  const identificador = id ?? name;

  return (
    <div className={classeCss('campo', erro !== undefined && 'campo--invalido', className)}>
      <label htmlFor={identificador}>{rotulo}</label>
      <input id={identificador} aria-invalid={erro !== undefined} {...props} />
      {erro !== undefined ? (
        <span className="campo__erro" role="alert">
          {erro}
        </span>
      ) : null}
    </div>
  );
}

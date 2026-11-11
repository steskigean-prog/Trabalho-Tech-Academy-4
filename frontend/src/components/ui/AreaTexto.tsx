import { type TextareaHTMLAttributes } from 'react';
import { classeCss } from '../../utils/formato';

interface PropsAreaTexto extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rotulo: string;
  erro?: string;
}

/** Área de texto com rótulo e estado de erro. */
export function AreaTexto({ rotulo, erro, id, name, className, ...props }: PropsAreaTexto) {
  const identificador = id ?? name;

  return (
    <div className={classeCss('campo', erro !== undefined && 'campo--invalido', className)}>
      <label htmlFor={identificador}>{rotulo}</label>
      <textarea id={identificador} aria-invalid={erro !== undefined} {...props} />
      {erro !== undefined ? (
        <span className="campo__erro" role="alert">
          {erro}
        </span>
      ) : null}
    </div>
  );
}

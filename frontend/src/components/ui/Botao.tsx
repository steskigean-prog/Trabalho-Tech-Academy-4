import { type ButtonHTMLAttributes } from 'react';
import { classeCss } from '../../utils/formato';

interface PropsBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo' | 'sucesso' | 'texto';
  carregando?: boolean;
}

/** Botão genérico com variantes visuais e estado de carregamento. */
export function Botao({
  variante = 'primario',
  carregando = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: PropsBotao) {
  return (
    <button
      type={type}
      className={classeCss('btn', `btn-${variante}`, className)}
      disabled={disabled === true || carregando}
      {...props}
    >
      {carregando ? <span className="espinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

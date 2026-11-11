import { type ReactNode } from 'react';
import { classeCss } from '../../utils/formato';

interface PropsCartao {
  titulo?: string;
  children: ReactNode;
  className?: string;
}

/** Cartão de conteúdo (superfície elevada) usado em telas e formulários. */
export function Cartao({ titulo, children, className }: PropsCartao) {
  return (
    <section className={classeCss('cartao', className)}>
      {titulo !== undefined ? <h2 className="cartao__titulo">{titulo}</h2> : null}
      {children}
    </section>
  );
}

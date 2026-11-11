export type TipoAlerta = 'sucesso' | 'erro' | 'informacao';

interface PropsAlerta {
  tipo: TipoAlerta;
  mensagem: string;
}

const ICONES: Record<TipoAlerta, string> = {
  sucesso: '✓',
  erro: '✕',
  informacao: 'i',
};

/** Mensagem destacada (sucesso, erro ou informação). */
export function Alerta({ tipo, mensagem }: PropsAlerta) {
  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <span className="alerta__icone" aria-hidden="true">
        {ICONES[tipo]}
      </span>
      <span className="alerta__texto">{mensagem}</span>
    </div>
  );
}

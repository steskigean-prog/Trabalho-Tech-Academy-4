import { Botao } from './Botao';

interface PropsConfirmacao {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

/** Diálogo de confirmação para ações destrutivas (ex.: exclusões). */
export function Confirmacao({ aberto, titulo, mensagem, aoConfirmar, aoCancelar }: PropsConfirmacao) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="modal__fundo" onClick={aoCancelar} />
      <div className="modal__caixa">
        <h3 id="modal-titulo">{titulo}</h3>
        <p>{mensagem}</p>
        <div className="modal__acoes">
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar
          </Botao>
          <Botao variante="perigo" onClick={aoConfirmar}>
            Sim, excluir
          </Botao>
        </div>
      </div>
    </div>
  );
}

import { ErroAplicacao } from './ErroAplicacao';

/**
 * Erro de validação de um ou mais campos da entidade.
 *
 * O mapa `campos` segue o mesmo formato dos detalhes da API
 * ({ nomeDoCampo: mensagem }), facilitando destacar o formulário.
 */
export class ErroValidacao extends ErroAplicacao {
  constructor(
    public readonly campos: Record<string, string>,
    mensagem = 'Dados inválidos',
  ) {
    super(mensagem);
  }
}

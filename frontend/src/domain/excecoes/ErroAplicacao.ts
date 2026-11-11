/**
 * Exceção base da aplicação.
 *
 * Todos os erros do domínio herdam desta classe, permitindo que as telas
 * capturem erros conhecidos e exibam mensagens amigáveis ao usuário.
 */
export class ErroAplicacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

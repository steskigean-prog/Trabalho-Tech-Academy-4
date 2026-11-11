/**
 * Contrato dos validadores de campo (espelha a hierarquia do backend PHP).
 *
 * Cada regra é uma subclasse concreta; novas regras são adicionadas sem
 * alterar quem as executa (aberto/fechado) e qualquer subclasse substitui a
 * base sem quebrar o comportamento (substituição de Liskov).
 */
export abstract class Validador {
  protected constructor(protected readonly mensagemErro: string) {}

  get mensagem(): string {
    return this.mensagemErro;
  }

  abstract validar(valor: unknown): boolean;
}

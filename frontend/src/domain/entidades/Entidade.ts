/**
 * Entidade base do domínio.
 *
 * O identificador é um campo privado nativo (#id): nem subclasses acessam
 * o estado diretamente — apenas pelos accessors, que garantem invariantes.
 */
export abstract class Entidade {
  #id: number | null;

  protected constructor(id: number | null = null) {
    this.#id = id;
  }

  get id(): number | null {
    return this.#id;
  }

  set id(valor: number | null) {
    if (valor !== null && !Number.isInteger(valor)) {
      throw new Error('O identificador deve ser um número inteiro');
    }

    this.#id = valor;
  }

  /** Payload enviado ao backend nas operações de criação/edição. */
  abstract paraJSON(): Record<string, unknown>;
}

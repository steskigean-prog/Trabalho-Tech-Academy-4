import type { DadosUsuario } from '../../tipos';
import { ErroValidacao } from '../excecoes/ErroValidacao';
import { ValidadorCpf } from '../validadores/ValidadorCpf';
import { ValidadorTamanhoMinimo } from '../validadores/ValidadorTamanhoMinimo';
import { Entidade } from './Entidade';

/**
 * Usuário autenticado.
 *
 * Regras de encapsulamento:
 * - o e-mail não possui setter: é imutável após o cadastro (regra de negócio
 *   exigida pela rubrica — o backend também recusa a troca);
 * - nome e CPF possuem setters com validação;
 * - a senha nunca é armazenada na entidade: vai direto ao serviço.
 */
export class Usuario extends Entidade {
  #nome: string;
  readonly #email: string;
  #cpf: string;
  readonly #ativo: boolean;

  constructor(dados: DadosUsuario) {
    super(dados.id);
    this.#email = dados.email;
    this.#ativo = dados.ativo;
    this.#nome = dados.nome;
    this.#cpf = dados.cpf;
  }

  get nome(): string {
    return this.#nome;
  }

  set nome(valor: string) {
    if (!new ValidadorTamanhoMinimo(3).validar(valor)) {
      throw new ErroValidacao({ nome: 'O nome deve ter ao menos 3 caracteres' });
    }

    this.#nome = valor.trim();
  }

  /** E-mail é apenas leitura: não pode ser alterado. */
  get email(): string {
    return this.#email;
  }

  get cpf(): string {
    return this.#cpf;
  }

  set cpf(valor: string) {
    if (!new ValidadorCpf().validar(valor)) {
      throw new ErroValidacao({ cpf: 'CPF inválido' });
    }

    this.#cpf = valor.replace(/\D/g, '');
  }

  get ativo(): boolean {
    return this.#ativo;
  }

  paraJSON(): Record<string, unknown> {
    return {
      id: this.id,
      nome: this.#nome,
      email: this.#email,
      cpf: this.#cpf,
      ativo: this.#ativo,
    };
  }
}

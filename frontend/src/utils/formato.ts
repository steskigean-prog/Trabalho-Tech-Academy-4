/** Monta a lista de classes CSS, ignorando valores falsos. */
export function classeCss(...partes: Array<string | false | null | undefined>): string {
  return partes.filter(Boolean).join(' ');
}

/** Aplica a máscara 000.000.000-00 a um CPF (apenas exibição). */
export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

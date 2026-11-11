import { classeCss } from '../../utils/formato';

interface CriterioSenha {
  rotulo: string;
  atendido(senha: string): boolean;
}

/** Critérios de nível de senha — os quatro primeiros são exigidos pelo sistema. */
const CRITERIOS: readonly CriterioSenha[] = [
  { rotulo: 'Ao menos 8 caracteres', atendido: (senha) => senha.length >= 8 },
  { rotulo: 'Uma letra maiúscula', atendido: (senha) => /[A-Z]/.test(senha) },
  { rotulo: 'Uma letra minúscula', atendido: (senha) => /[a-z]/.test(senha) },
  { rotulo: 'Um número', atendido: (senha) => /\d/.test(senha) },
  { rotulo: 'Um caractere especial (ex.: @, #, !)', atendido: (senha) => /[^A-Za-z0-9]/.test(senha) },
];

interface NivelSenha {
  rotulo: string;
  classe: string;
}

function nivelDaSenha(atendidos: number): NivelSenha {
  if (atendidos <= 1) {
    return { rotulo: 'Fraca', classe: 'medidor__segmento--fraca' };
  }

  if (atendidos <= 3) {
    return { rotulo: 'Média', classe: 'medidor__segmento--media' };
  }

  if (atendidos === 4) {
    return { rotulo: 'Forte', classe: 'medidor__segmento--forte' };
  }

  return { rotulo: 'Excelente', classe: 'medidor__segmento--excelente' };
}

interface PropsMedidorSenha {
  senha: string;
}

/**
 * Indicador visual do nível da senha.
 *
 * Barra de segmentos + checklist dos critérios; os quatro primeiros são os
 * exigidos pelo sistema (mínimo: maiúscula, minúscula e número).
 */
export function MedidorSenha({ senha }: PropsMedidorSenha) {
  const resultados = CRITERIOS.map((criterio) => criterio.atendido(senha));
  const atendidos = resultados.filter(Boolean).length;
  const nivel = nivelDaSenha(atendidos);

  return (
    <div className="medidor">
      <div className="medidor__barra" aria-hidden="true">
        {resultados.map((atendido, indice) => (
          <span
            key={CRITERIOS[indice]?.rotulo ?? indice}
            className={classeCss('medidor__segmento', atendido && nivel.classe)}
          />
        ))}
      </div>

      <p className="medidor__rotulo">
        Força da senha: <strong>{senha === '' ? '—' : nivel.rotulo}</strong>
      </p>

      <ul className="medidor__criterios">
        {CRITERIOS.map((criterio, indice) => (
          <li
            key={criterio.rotulo}
            className={classeCss('medidor__criterio', resultados[indice] === true && 'medidor__criterio--ok')}
          >
            <span aria-hidden="true">{resultados[indice] === true ? '✓' : '•'}</span>
            {criterio.rotulo}
          </li>
        ))}
      </ul>
    </div>
  );
}

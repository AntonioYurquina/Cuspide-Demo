/**
 * La dentición que dibuja el odontograma corresponde a la edad del paciente.
 *
 * **Por qué se mide.** Es una regla del oficio metida en el código, y de las que se rompen sin
 * que nada falle: la ficha sigue dibujándose, sólo que con la boca equivocada. Nadie que no sea
 * odontólogo lo nota mirando la pantalla — y quien sí lo nota es exactamente la persona a la que
 * se le está mostrando el sistema para venderlo.
 *
 * Ya pasó una vez en esta misma ficha: la primera versión le dibujaba cuatro piezas permanentes
 * a una nena de cuatro años, que no tiene ninguna.
 */

import { describe, expect, it } from 'vitest';
import { PACIENTES } from '../../datos/consultorio.ts';
import { denticionDe, odontogramaDe } from './Odontograma.tsx';

describe('dentición por edad', () => {
  it('a los 4 años son veinte temporarias y ninguna permanente', () => {
    const { permanentes, temporarias } = denticionDe(4);
    expect(permanentes).toEqual([]);
    expect(temporarias).toHaveLength(20);
  });

  it('a los 8 años la dentición es mixta', () => {
    const { permanentes, temporarias } = denticionDe(8);
    expect(permanentes.length).toBeGreaterThan(0);
    expect(temporarias.length).toBeGreaterThan(0);
    // A esa edad ya están los primeros molares y los incisivos, y todavía no los premolares.
    expect(permanentes).toContain(16);
    expect(permanentes).toContain(11);
    expect(permanentes).not.toContain(14);
  });

  it('a los 20 años son treinta y dos permanentes y ninguna temporaria', () => {
    const { permanentes, temporarias } = denticionDe(20);
    expect(permanentes).toHaveLength(32);
    expect(temporarias).toEqual([]);
  });

  it('ninguna pieza aparece dos veces, y los números son los del sistema FDI', () => {
    for (const años of [4, 8, 12, 20, 70]) {
      const { permanentes, temporarias } = denticionDe(años);
      const todas = [...permanentes, ...temporarias];
      expect(new Set(todas).size, `edad ${años}`).toBe(todas.length);
      for (const n of permanentes) {
        expect(Math.floor(n / 10), `permanente ${n}`).toBeGreaterThanOrEqual(1);
        expect(Math.floor(n / 10), `permanente ${n}`).toBeLessThanOrEqual(4);
        expect(n % 10, `permanente ${n}`).toBeGreaterThanOrEqual(1);
        expect(n % 10, `permanente ${n}`).toBeLessThanOrEqual(8);
      }
      for (const n of temporarias) {
        expect(Math.floor(n / 10), `temporaria ${n}`).toBeGreaterThanOrEqual(5);
        expect(Math.floor(n / 10), `temporaria ${n}`).toBeLessThanOrEqual(8);
        expect(n % 10, `temporaria ${n}`).toBeLessThanOrEqual(5);
      }
    }
  });

  it('la cantidad de piezas nunca baja al crecer hasta la dentición definitiva', () => {
    // Entre los 6 y los 12 hay recambio: se cae una temporaria y sube su permanente. Un hueco
    // transitorio es normal, pero la boca no puede quedarse a la mitad.
    for (let años = 3; años <= 25; años++) {
      const { permanentes, temporarias } = denticionDe(años);
      expect(permanentes.length + temporarias.length, `edad ${años}`).toBeGreaterThanOrEqual(12);
    }
  });
});

describe('los hallazgos sembrados se reparten por la boca', () => {
  /**
   * **Por qué se mide, y por qué se mide así.** La primera versión mezclaba la semilla con una
   * cuenta lineal: `semilla * 31 + numero * 7 + i`. Al recorrer un cuadrante el número de pieza
   * baja de a uno mientras el índice sube de a uno, así que el valor cambiaba de a **exactamente
   * −6** — y todos los hallazgos se deciden con módulos. Resultado: cuadrantes enteros con las
   * ocho piezas en el mismo estado, una arcada impecable y la otra marcada entera. Nada falla, la
   * ficha se dibuja igual, y es de las cosas que un odontólogo ve de un vistazo.
   *
   * Se mide **cuántos cuadrantes quedan uniformes** sobre el total, y no un caso puntual: la
   * concentración es una propiedad de la distribución, no de un paciente. Medido, la versión
   * lineal daba 107 cuadrantes uniformes de 160 y la mezclada da 41 — que no es cero porque una
   * boca sana también es uniforme, y eso está bien.
   */
  const conHallazgo = (p: ReturnType<typeof odontogramaDe>[number]) =>
    p.estado !== 'presente' || Object.values(p.caras).some((e) => e && e !== 'sana');

  const { permanentes } = denticionDe(30);
  const cuadrante = (numero: number) => Math.floor(numero / 10);

  it('los primeros pacientes no tienen todos los hallazgos en una sola arcada', () => {
    // Los primeros, y no una media sobre los cuarenta, porque el problema es de demo: el sesgo
    // aparecía en dos pacientes de cuarenta, y uno de los dos era el primero de la lista.
    const { temporarias } = denticionDe(4);
    const sesgados: string[] = [];

    for (const paciente of PACIENTES.slice(0, 6)) {
      for (const [denticion, numeros] of [
        ['temporarias', temporarias],
        ['permanentes', permanentes],
      ] as const) {
        const marcadas = odontogramaDe(paciente, numeros).filter(conHallazgo);
        // Tres hallazgos los tres abajo es una boca corriente. Seis o más, todos de un lado, no.
        if (marcadas.length < 6) continue;
        const arriba = marcadas.filter((p) => [1, 2, 5, 6].includes(cuadrante(p.numero))).length;
        if (arriba === 0 || arriba === marcadas.length) {
          sesgados.push(
            `${paciente.apellido} (${denticion}): ${marcadas.length} hallazgos, ${arriba} arriba`,
          );
        }
      }
    }

    expect(
      sesgados,
      'Todos los hallazgos caen en una sola arcada. Suele ser la semilla avanzando en paso fijo ' +
        'respecto de los módulos que deciden el estado: el hallazgo queda atado al número de pieza.',
    ).toEqual([]);
  });

  it('la boca no queda ni vacía ni entera marcada', () => {
    for (const paciente of PACIENTES.slice(0, 12)) {
      const marcadas = odontogramaDe(paciente, permanentes).filter(conHallazgo).length;
      expect(marcadas, `${paciente.apellido} sin ningún hallazgo`).toBeGreaterThan(0);
      // Una boca con todo marcado se lee como datos de relleno, que es lo contrario de lo que
      // busca una demo verosímil.
      expect(marcadas, `${paciente.apellido} con la boca entera marcada`).toBeLessThan(20);
    }
  });

  it('el mismo paciente da siempre el mismo odontograma', () => {
    const uno = odontogramaDe(PACIENTES[3]!, permanentes);
    const otra = odontogramaDe(PACIENTES[3]!, permanentes);
    expect(uno).toEqual(otra);
  });
});

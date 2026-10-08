/**
 * La página de inicio del centro: quiénes son, qué hacen, cuándo abren y dónde están.
 *
 * **Es la pantalla que tiene que contestar sola las preguntas que hoy llegan por WhatsApp**:
 * ¿atienden mi obra social?, ¿hasta qué hora abren?, ¿dónde quedan?, ¿quién atiende? Cada una de
 * esas preguntas contestada acá es una conversación que la secretaria no tiene.
 *
 * Por eso el orden no es el de un folleto de agencia —«nosotros», «misión», «valores»— sino el
 * de las preguntas, de la más frecuente a la menos: obras sociales y turno arriba, historia
 * nunca.
 *
 * Al celular primero, que es donde alguien busca un consultorio: el ancho de referencia es 390 y
 * lo demás son ensanchamientos.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MARCA } from '../marca.ts';
import { OBRAS_SOCIALES, PROFESIONALES } from '../datos/consultorio.ts';
import { CENTRO } from '../documentos/Hoja.tsx';
import { may, useEspecialidad } from '../especialidades/index.ts';
import { Encabezado } from './Marco.tsx';
import { useDatosEstructurados, useTitulo } from './seo.ts';

/** Los horarios del centro. En la etapa dos salen de la configuración. */
const HORARIOS = [
  { dias: 'Lunes a viernes', horas: '09:00 a 13:00 y 15:00 a 20:00' },
  { dias: 'Sábados', horas: '09:00 a 13:00' },
  { dias: 'Domingos y feriados', horas: 'Cerrado' },
] as const;

function Seccion({
  titulo,
  children,
  id,
  tono,
}: {
  titulo: string;
  children: React.ReactNode;
  id: string;
  tono?: 'gris';
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={tono === 'gris' ? 'bg-gris-50 py-12' : 'py-12'}
    >
      <div className="mx-auto max-w-5xl px-4">
        <h2
          id={`${id}-titulo`}
          className="text-[22px] font-bold tracking-[-.02em] text-gris-900 sm:text-[26px]"
        >
          {titulo}
        </h2>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}

export function PaginaSitio() {
  const { e } = useEspecialidad();

  useTitulo(
    MARCA.nombre,
    `${may(e.nombre)} en Salta. Turnos por internet, obras sociales y atención de lunes a sábado.`,
  );

  /*
   * Los datos del negocio como los espera un buscador. Es lo que hace que al costado del
   * resultado aparezcan el horario, la dirección y el teléfono en vez de un párrafo suelto — que
   * para un negocio local es lo que más mueve la aguja y no se ve en la pantalla.
   */
  useDatosEstructurados(
    useMemo(
      () => ({
        '@context': 'https://schema.org',
        '@type': 'MedicalClinic',
        name: MARCA.nombre,
        telephone: CENTRO.telefono,
        email: CENTRO.correo,
        address: {
          '@type': 'PostalAddress',
          streetAddress: CENTRO.direccion,
          addressLocality: 'Salta',
          addressCountry: 'AR',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '20:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '09:00',
            closes: '13:00',
          },
        ],
        medicalSpecialty: e.nombre,
        availableService: e.practicas.map((p) => ({ '@type': 'MedicalProcedure', name: p })),
        employee: PROFESIONALES.map((p) => ({ '@type': 'Person', name: p.nombre })),
      }),
      [e],
    ),
  );

  return (
    <>
      <Encabezado
        titulo={MARCA.nombre}
        bajada={`${may(e.nombre)} en Salta. Turnos por internet, obras sociales y atención de lunes a sábado.`}
      />

      <div className="mx-auto flex max-w-5xl flex-wrap gap-3 px-4 pb-4">
        <Link
          to="/turnos-online"
          className="rounded-[10px] bg-marca-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-marca-700"
        >
          Pedir un turno
        </Link>
        <a
          href={`tel:${CENTRO.telefono.replace(/\D/g, '')}`}
          className="rounded-[10px] border border-gris-300 px-5 py-3 text-sm font-medium text-gris-800 transition-colors hover:bg-gris-50"
        >
          Llamar al {CENTRO.telefono}
        </a>
      </div>

      {/* Lo que más se pregunta, primero. */}
      <Seccion id="obras-sociales" titulo="Obras sociales que atendemos" tono="gris">
        <ul className="flex flex-wrap gap-2">
          {OBRAS_SOCIALES.filter((o) => o !== 'Particular').map((o) => (
            <li
              key={o}
              className="rounded-full border border-gris-200 bg-white px-4 py-1.5 text-sm font-medium text-gris-800"
            >
              {o}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-gris-600">
          También atendemos en forma particular. Las coberturas pueden requerir autorización previa:
          consultanos antes de tu turno.
        </p>
      </Seccion>

      <Seccion id="servicios" titulo={may(e.unidad.plural)}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {e.practicas.map((p) => (
            <li
              key={p}
              className="flex items-start gap-2.5 rounded-[10px] border border-gris-200 px-4 py-3 text-sm text-gris-800"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-marca-500"
              />
              {p}
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="equipo" titulo="Quiénes atienden" tono="gris">
        <ul className="grid gap-4 sm:grid-cols-3">
          {PROFESIONALES.map((p) => (
            <li key={p.id} className="rounded-[12px] border border-gris-200 bg-white p-5">
              <p className="text-base font-semibold text-gris-900">{p.nombre}</p>
              <p className="mt-0.5 text-sm text-gris-700">
                {may(p.genero === 'f' ? e.profesionalF.singular : e.profesional.singular)}
              </p>
              <p className="tabular mt-1 text-xs text-gris-500">{p.matricula}</p>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion id="horarios" titulo="Horarios y dónde estamos">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <dl className="space-y-2 text-sm">
              {HORARIOS.map((h) => (
                <div
                  key={h.dias}
                  className="flex flex-wrap justify-between gap-2 border-b border-gris-200 pb-2"
                >
                  <dt className="font-medium text-gris-900">{h.dias}</dt>
                  <dd className="tabular text-gris-700">{h.horas}</dd>
                </div>
              ))}
            </dl>

            <address className="mt-5 text-sm not-italic text-gris-700">
              <p className="font-medium text-gris-900">{CENTRO.direccion}</p>
              <p className="mt-1">
                <a href={`tel:${CENTRO.telefono.replace(/\D/g, '')}`} className="underline">
                  {CENTRO.telefono}
                </a>
              </p>
              <p>
                <a href={`mailto:${CENTRO.correo}`} className="underline">
                  {CENTRO.correo}
                </a>
              </p>
            </address>
          </div>

          <Mapa />
        </div>
      </Seccion>
    </>
  );
}

/**
 * El mapa.
 *
 * Dibujado, no embebido: un mapa de terceros trae **un rastreador y medio megabyte** a la
 * pantalla que más tiene que cargar rápido, y en una demo además depende de una clave de API que
 * hoy no existe. Lo que un paciente necesita es saber en qué esquina es y poder abrirlo en su
 * teléfono — y eso lo da un enlace, que es lo que hace el botón.
 */
function Mapa() {
  const busqueda = encodeURIComponent(`${CENTRO.direccion}, Argentina`);
  return (
    <figure className="overflow-hidden rounded-[12px] border border-gris-200">
      <svg
        viewBox="0 0 320 200"
        className="w-full bg-gris-50"
        role="img"
        aria-label={`Ubicación aproximada: ${CENTRO.direccion}`}
      >
        {/* Manzanas */}
        {[0, 1, 2].map((f) =>
          [0, 1, 2, 3].map((c) => (
            <rect
              key={`${f}-${c}`}
              x={14 + c * 78}
              y={12 + f * 64}
              width="60"
              height="46"
              rx="2"
              className="fill-gris-200"
            />
          )),
        )}
        {/* La avenida */}
        <rect x="0" y="62" width="320" height="12" className="fill-marca-100" />
        <text x="8" y="58" className="fill-gris-600" style={{ fontSize: '9px' }}>
          Av. Belgrano
        </text>
        {/* El centro */}
        <g transform="translate(150, 68)">
          <circle r="13" className="fill-marca-600" />
          <path
            d="M0 -6v12M-6 0h12"
            className="stroke-white"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <figcaption className="border-t border-gris-200 bg-white px-4 py-3 text-sm">
        <p className="text-gris-700">{CENTRO.direccion}</p>
        <a
          href={`https://www.openstreetmap.org/search?query=${busqueda}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-marca-700 underline"
        >
          Abrir en el mapa
        </a>
      </figcaption>
    </figure>
  );
}

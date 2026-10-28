/**
 * El crédito de quien desarrolló el sistema: «Desarrollado por Arkode».
 *
 * Va en dos lugares y en ninguno más: al pie del sitio público y al pie del ingreso del personal.
 * El panel de gestión no lo repite — es una herramienta de trabajo y quien entra ya pasó por el
 * ingreso.
 *
 * El tono es `gris-700` y no `gris-500`, el apagado de siempre: sobre los fondos claros del pie y
 * del ingreso el `gris-500` no llega al contraste mínimo para texto chico.
 */

export function Credito({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-gris-700 ${className}`}>
      Desarrollado por{' '}
      <a
        href="https://arkode.com.ar"
        target="_blank"
        rel="noopener"
        className="font-semibold text-gris-800 underline hover:text-marca-700"
      >
        Arkode
      </a>
    </p>
  );
}
